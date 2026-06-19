using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BaseCore.Common;
using BaseCore.Services.Authen;
using BaseCore.Repository;
using BaseCore.AuthService.Services;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace BaseCore.AuthService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        private readonly MySqlDbContext _dbContext;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly OtpStore _otpStore;
        private readonly EmailService _emailService;
        private readonly int _tokenExpirationMinutes = 480;

        public AuthController(
            IUserService userService,
            IConfiguration configuration,
            ILogger<AuthController> logger,
            MySqlDbContext dbContext,
            IHttpClientFactory httpClientFactory,
            OtpStore otpStore,
            EmailService emailService)
        {
            _userService = userService;
            _configuration = configuration;
            _logger = logger;
            _dbContext = dbContext;
            _httpClientFactory = httpClientFactory;
            _otpStore = otpStore;
            _emailService = emailService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userService.Authenticate(request.Username, request.Password);
            if (user == null)
                return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng." });

            var token = GenerateJwt(user.Id.ToString(), user.UserName, user.UserType);

            return Ok(new
            {
                token,
                userId = user.Id.ToString(),
                username = user.UserName,
                name = user.Name,
                email = user.Email,
                role = user.UserType == 1 ? "Admin" : "User",
                expiresIn = _tokenExpirationMinutes * 60,
                isGoogleUser = false
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!IsPasswordComplex(request.Password))
                return BadRequest(new { message = "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số." });

            try
            {
                var user = new BaseCore.Entities.User
                {
                    UserName = request.Username,
                    Name = request.Name ?? request.Username,
                    Email = request.Email,
                    Phone = request.Phone,
                    UserType = 2
                };

                var createdUser = await _userService.Create(user, request.Password);
                return Ok(new { message = "Đăng ký thành công", userId = createdUser.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Registration failed for username: {Username}", request.Username);
                return BadRequest(new { message = "Đăng ký thất bại. Tên đăng nhập có thể đã tồn tại." });
            }
        }

        // Đăng nhập bằng Google: frontend gửi ID Token nhận được từ Google Sign-In.
        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            if (string.IsNullOrEmpty(request.IdToken))
                return BadRequest(new { message = "ID Token không được để trống." });

            var tokenInfo = await VerifyGoogleToken(request.IdToken);
            if (tokenInfo == null || string.IsNullOrEmpty(tokenInfo.Sub) || string.IsNullOrEmpty(tokenInfo.Email))
                return Unauthorized(new { message = "Token Google không hợp lệ hoặc đã hết hạn." });

            // Nếu có cấu hình Client ID, kiểm tra khớp để tránh token từ app khác.
            var expectedClientId = _configuration["Google:ClientId"];
            if (!string.IsNullOrEmpty(expectedClientId) &&
                expectedClientId != "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com" &&
                tokenInfo.Aud != expectedClientId)
                return Unauthorized(new { message = "Google Client ID không khớp." });

            if (tokenInfo.EmailVerified != "true")
                return Unauthorized(new { message = "Email Google chưa được xác minh." });

            // Tìm tài khoản theo GoogleId, sau đó fallback theo email.
            var user = await _dbContext.Users.FirstOrDefaultAsync(u =>
                (u.GoogleId != null && u.GoogleId == tokenInfo.Sub) ||
                (u.Email != null && u.Email == tokenInfo.Email));

            if (user == null)
            {
                // Tạo tài khoản mới từ thông tin Google.
                var baseUsername = "gg_" + Regex.Replace(tokenInfo.Email.Split('@')[0], @"[^a-zA-Z0-9]", "").ToLower();
                var username = baseUsername;
                var counter = 1;
                while (await _dbContext.Users.AnyAsync(u => u.UserName == username))
                    username = baseUsername + counter++;

                user = new BaseCore.Entities.User
                {
                    UserName = username,
                    Name = tokenInfo.Name ?? tokenInfo.Email.Split('@')[0],
                    Email = tokenInfo.Email,
                    GoogleId = tokenInfo.Sub,
                    Password = "",
                    Salt = Array.Empty<byte>(),
                    UserType = 2,
                    IsActive = true,
                    Created = DateTime.Now
                };
                _dbContext.Users.Add(user);
                await _dbContext.SaveChangesAsync();
            }
            else if (string.IsNullOrEmpty(user.GoogleId))
            {
                // Liên kết tài khoản đã có với Google.
                user.GoogleId = tokenInfo.Sub;
                await _dbContext.SaveChangesAsync();
            }

            var jwtToken = GenerateJwt(user.Id.ToString(), user.UserName, user.UserType);

            return Ok(new
            {
                token = jwtToken,
                userId = user.Id.ToString(),
                username = user.UserName,
                name = user.Name,
                email = user.Email,
                role = user.UserType == 1 ? "Admin" : "User",
                expiresIn = _tokenExpirationMinutes * 60,
                isGoogleUser = true
            });
        }

        // Gửi OTP tới email: chỉ dành cho tài khoản Google (kiểm tra phía client qua isGoogleUser).
        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || !request.Email.Contains('@'))
                return BadRequest(new { message = "Email không hợp lệ." });

            var code = _otpStore.GenerateAndStore(request.Email);

            try
            {
                await _emailService.SendOtpAsync(request.Email, code);
                _logger.LogInformation("OTP sent to {Email}", request.Email);
                return Ok(new { message = $"Mã OTP đã được gửi tới {request.Email}." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send OTP to {Email}", request.Email);
                return StatusCode(500, new { message = "Không thể gửi email. Kiểm tra cấu hình SMTP trong appsettings.json." });
            }
        }

        // Xác minh OTP người dùng nhập.
        [HttpPost("verify-otp")]
        public IActionResult VerifyOtp([FromBody] VerifyOtpRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Code))
                return BadRequest(new { message = "Email và mã OTP không được để trống." });

            var isValid = _otpStore.Verify(request.Email, request.Code);
            if (!isValid)
                return BadRequest(new { message = "Mã OTP không đúng hoặc đã hết hạn (5 phút)." });

            return Ok(new { message = "Xác thực OTP thành công." });
        }

        private string GenerateJwt(string userId, string userName, int userType)
        {
            return TokenHelper.GenerateToken(
                _configuration["Jwt:SecretKey"]!,
                _tokenExpirationMinutes,
                userId,
                userName,
                userType == 1 ? "Admin" : "User",
                _configuration["Jwt:Issuer"] ?? "BaseCore",
                _configuration["Jwt:Audience"] ?? "BaseCore.Clients"
            );
        }

        private async Task<GoogleTokenInfo?> VerifyGoogleToken(string idToken)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                var url = $"https://oauth2.googleapis.com/tokeninfo?id_token={Uri.EscapeDataString(idToken)}";
                var response = await client.GetAsync(url);
                if (!response.IsSuccessStatusCode) return null;
                return await response.Content.ReadFromJsonAsync<GoogleTokenInfo>();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Google token verification failed");
                return null;
            }
        }

        private static bool IsPasswordComplex(string password)
        {
            if (password.Length < 8) return false;
            if (!Regex.IsMatch(password, @"[A-Z]")) return false;
            if (!Regex.IsMatch(password, @"[a-z]")) return false;
            if (!Regex.IsMatch(password, @"[0-9]")) return false;
            return true;
        }
    }

    // ---- DTOs ----

    public class LoginRequest
    {
        [Required(ErrorMessage = "Username is required")]
        public string Username { get; set; } = "";

        [Required(ErrorMessage = "Password is required")]
        public string Password { get; set; } = "";
    }

    public class RegisterRequest
    {
        [Required(ErrorMessage = "Username is required")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be 3-50 characters")]
        public string Username { get; set; } = "";

        [Required(ErrorMessage = "Password is required")]
        public string Password { get; set; } = "";

        public string? Name { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string? Email { get; set; }

        public string? Phone { get; set; }
    }

    public class GoogleLoginRequest
    {
        public string IdToken { get; set; } = "";
    }

    public class SendOtpRequest
    {
        public string Email { get; set; } = "";
    }

    public class VerifyOtpRequest
    {
        public string Email { get; set; } = "";
        public string Code { get; set; } = "";
    }

    internal class GoogleTokenInfo
    {
        [JsonPropertyName("sub")] public string Sub { get; set; } = "";
        [JsonPropertyName("email")] public string Email { get; set; } = "";
        [JsonPropertyName("name")] public string? Name { get; set; }
        [JsonPropertyName("aud")] public string Aud { get; set; } = "";
        [JsonPropertyName("email_verified")] public string EmailVerified { get; set; } = "";
    }
}

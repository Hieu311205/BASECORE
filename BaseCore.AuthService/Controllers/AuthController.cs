using Microsoft.AspNetCore.Mvc;
using BaseCore.Common;
using BaseCore.Services.Authen;
using System.Threading.Tasks;

namespace BaseCore.AuthService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private const string SecretKey = "YourSecretKeyForAuthenticationShouldBeLongEnough";
        private const int TokenExpirationMinutes = 480; // 8 hours

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Validate input sớm để tránh gọi service khi thiếu username/password.
            if (request == null || string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }

            var user = await _userService.Authenticate(request.Username, request.Password);

            if (user == null)
            {
                // Không tiết lộ username hay password sai để giảm rò rỉ thông tin đăng nhập.
                return Unauthorized(new { message = "Invalid username or password" });
            }

            // Sinh JWT chứa userId, username và role để các service khác xác thực bằng [Authorize].
            var token = TokenHelper.GenerateToken(
                SecretKey,
                TokenExpirationMinutes,
                user.Id.ToString(),
                user.UserName,
                user.UserType == 1 ? "Admin" : "User"
            );

            return Ok(new LoginResponse
            {
                Token = token,
                UserId = user.Id.ToString(),
                Username = user.UserName,
                Name = user.Name,
                Email = user.Email,
                Role = user.UserType == 1 ? "Admin" : "User",
                ExpiresIn = TokenExpirationMinutes * 60
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Register kiểm tra dữ liệu tối thiểu trước khi tạo entity user.
            if (request == null)
            {
                return BadRequest(new { message = "Invalid request" });
            }

            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }

            if (request.Password.Length < 6)
            {
                return BadRequest(new { message = "Password must be at least 6 characters" });
            }

            try
            {
                var user = new BaseCore.Entities.User
                {
                    // UserType = 2 là tài khoản thường; quyền admin không được cấp từ API register public.
                    UserName = request.Username,
                    Name = request.Name ?? request.Username,
                    Email = request.Email,  
                    Phone = request.Phone,
                    UserType = 2 // Default to regular user
                };

                var createdUser = await _userService.Create(user, request.Password);

                return Ok(new { message = "Registration successful", userId = createdUser.Id });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = "Registration failed: " + ex.Message });
            }
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class LoginResponse
    {
        public string Token { get; set; }
        public string UserId { get; set; }
        public string Username { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public int ExpiresIn { get; set; }
    }

    public class RegisterRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
    }
}

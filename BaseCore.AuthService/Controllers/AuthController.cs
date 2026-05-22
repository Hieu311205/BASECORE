using Microsoft.AspNetCore.Mvc;
using BaseCore.Common;
using BaseCore.Services.Authen;
using System.Threading.Tasks;

namespace BaseCore.AuthService.Controllers
{
    // Controller xử lý đăng nhập và đăng ký tài khoản.
    // URL: /api/auth
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        // Khóa bí mật để ký JWT token (giống chữ ký số để xác thực token)
        private const string SecretKey = "YourSecretKeyForAuthenticationShouldBeLongEnough";

        // Token có hiệu lực 480 phút = 8 tiếng (sau đó user phải đăng nhập lại)
        private const int TokenExpirationMinutes = 480;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        // POST /api/auth/login
        // Đăng nhập: kiểm tra tài khoản và trả về JWT token
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Kiểm tra dữ liệu đầu vào
            if (request == null || string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }

            // Xác thực tài khoản: kiểm tra username + password
            var user = await _userService.Authenticate(request.Username, request.Password);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid username or password" }); // 401: sai tài khoản
            }

            // Tạo JWT token chứa thông tin user (userId, username, role)
            // Token này sẽ được gửi trong header Authorization của các request tiếp theo
            var token = TokenHelper.GenerateToken(
                SecretKey,
                TokenExpirationMinutes,
                user.Id.ToString(),
                user.UserName,
                user.UserType == 1 ? "Admin" : "User" // UserType 1 = Admin, còn lại = User
            );

            // Trả về token và thông tin user để frontend lưu lại
            return Ok(new LoginResponse
            {
                Token = token,
                UserId = user.Id.ToString(),
                Username = user.UserName,
                Name = user.Name,
                Email = user.Email,
                Role = user.UserType == 1 ? "Admin" : "User",
                ExpiresIn = TokenExpirationMinutes * 60 // Đổi sang giây cho frontend dễ xử lý
            });
        }

        // POST /api/auth/register
        // Đăng ký tài khoản mới (ai cũng có thể gọi, không cần đăng nhập trước)
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Invalid request" });
            }

            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }

            // Mật khẩu phải dài ít nhất 6 ký tự
            if (request.Password.Length < 6)
            {
                return BadRequest(new { message = "Password must be at least 6 characters" });
            }

            try
            {
                var user = new BaseCore.Entities.User
                {
                    UserName = request.Username,
                    Name = request.Name ?? request.Username, // Dùng username làm tên nếu không có tên
                    Email = request.Email,
                    Phone = request.Phone,
                    UserType = 0 // Mặc định là User thường (không phải Admin)
                };

                // UserService.Create sẽ hash mật khẩu trước khi lưu
                var createdUser = await _userService.Create(user, request.Password);

                return Ok(new { message = "Registration successful", userId = createdUser.Id });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = "Registration failed: " + ex.Message });
            }
        }
    }

    // DTO cho request đăng nhập
    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    // DTO cho response đăng nhập thành công
    public class LoginResponse
    {
        public string Token { get; set; }      // JWT token để dùng trong các request tiếp theo
        public string UserId { get; set; }     // Id của user
        public string Username { get; set; }   // Tên đăng nhập
        public string Name { get; set; }       // Tên hiển thị
        public string Email { get; set; }
        public string Role { get; set; }       // "Admin" hoặc "User"
        public int ExpiresIn { get; set; }     // Số giây trước khi token hết hạn
    }

    // DTO cho request đăng ký tài khoản
    public class RegisterRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
    }
}

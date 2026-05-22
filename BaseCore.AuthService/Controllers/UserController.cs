using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Services.Authen;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace BaseCore.AuthService.Controllers
{
    // Controller quản lý người dùng.
    // URL: /api/users
    // [Authorize]: toàn bộ endpoint yêu cầu đăng nhập
    [Route("api/users")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        // GET /api/users?keyword=nguyen&page=1&pageSize=10
        // Lấy danh sách user (chỉ Admin mới được xem)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] string keyword = "", [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var (users, totalCount) = await _userService.Search(keyword, page, pageSize);

            // Chuyển đổi entity User sang UserResponse (DTO) để không trả về password/salt
            var result = users.Select(u => new UserResponse
            {
                Id = u.Id,
                Username = u.UserName,
                Name = u.Name,
                Email = u.Email,
                Phone = u.Phone,
                Position = u.Position,
                IsActive = u.IsActive,
                UserType = u.UserType,
                Created = u.Created
            });

            return Ok(new
            {
                data = result,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }

        // GET /api/users/5
        // Lấy thông tin một user theo id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _userService.GetById(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Trả về UserResponse thay vì User entity (tránh lộ password/salt)
            return Ok(new UserResponse
            {
                Id = user.Id,
                Username = user.UserName,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Position = user.Position,
                IsActive = user.IsActive,
                UserType = user.UserType,
                Created = user.Created
            });
        }

        // POST /api/users
        // Tạo user mới (chỉ Admin)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Invalid request" });
            }

            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }

            try
            {
                var user = new User
                {
                    UserName = request.Username,
                    Name = request.Name ?? request.Username,
                    Email = request.Email,
                    Phone = request.Phone,
                    Position = request.Position,
                    UserType = request.UserType // Admin có thể chỉ định loại user
                };

                var createdUser = await _userService.Create(user, request.Password);

                return CreatedAtAction(nameof(GetById), new { id = createdUser.Id }, new UserResponse
                {
                    Id = createdUser.Id,
                    Username = createdUser.UserName,
                    Name = createdUser.Name,
                    Email = createdUser.Email,
                    Phone = createdUser.Phone,
                    Position = createdUser.Position,
                    IsActive = createdUser.IsActive,
                    UserType = createdUser.UserType,
                    Created = createdUser.Created
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to create user: " + ex.Message });
            }
        }

        // PUT /api/users/5
        // Cập nhật thông tin user (chỉ Admin)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Invalid request" });
            }

            var existingUser = await _userService.GetById(id);
            if (existingUser == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Cập nhật từng trường nếu được gửi lên (null = giữ nguyên)
            existingUser.Name = request.Name ?? existingUser.Name;
            existingUser.Email = request.Email ?? existingUser.Email;
            existingUser.Phone = request.Phone ?? existingUser.Phone;
            existingUser.Position = request.Position ?? existingUser.Position;
            existingUser.UserType = request.UserType ?? existingUser.UserType;
            existingUser.IsActive = request.IsActive ?? existingUser.IsActive;

            // Password chỉ thay đổi nếu được gửi lên (null = không đổi mật khẩu)
            await _userService.Update(existingUser, request.Password);

            return Ok(new UserResponse
            {
                Id = existingUser.Id,
                Username = existingUser.UserName,
                Name = existingUser.Name,
                Email = existingUser.Email,
                Phone = existingUser.Phone,
                Position = existingUser.Position,
                IsActive = existingUser.IsActive,
                UserType = existingUser.UserType,
                Created = existingUser.Created
            });
        }

        // DELETE /api/users/5
        // Xóa user (chỉ Admin)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var existingUser = await _userService.GetById(id);
            if (existingUser == null)
            {
                return NotFound(new { message = "User not found" });
            }

            await _userService.Delete(id);
            return NoContent(); // 204: xóa thành công, không có nội dung trả về
        }
    }

    // DTO trả về thông tin user (không có password/salt để bảo mật)
    public class UserResponse
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Position { get; set; }
        public bool IsActive { get; set; }
        public int UserType { get; set; }    // 0 = User, 1 = Admin, 2 = Manager
        public DateTime Created { get; set; }
    }

    // DTO để Admin tạo user mới
    public class CreateUserRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Position { get; set; }
        public int UserType { get; set; }
    }

    // DTO để Admin cập nhật thông tin user
    // Tất cả đều nullable để cập nhật từng phần (partial update)
    public class UpdateUserRequest
    {
        public string Password { get; set; }      // null = không thay đổi mật khẩu
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Position { get; set; }
        public int? UserType { get; set; }
        public bool? IsActive { get; set; }
    }
}

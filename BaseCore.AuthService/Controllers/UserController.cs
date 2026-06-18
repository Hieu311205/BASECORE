using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Services.Authen;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace BaseCore.AuthService.Controllers
{
    [Route("api/users")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            // Inject service để controller chỉ xử lý HTTP, còn nghiệp vụ user nằm ở service.
            _userService = userService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] string keyword = "", [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] bool? isActive = null, [FromQuery] int? excludeUserType = null)
        {
            // Admin lấy danh sách user có tìm kiếm và phân trang.
            var (users, totalCount) = await _userService.Search(keyword, page, pageSize, isActive, excludeUserType);

            // Map entity sang response DTO để không trả password/salt ra client.
            var result = users.Select(u => new UserResponse
            {
                Id = u.Id,
                Username = u.UserName,
                Name = u.Name,
                Email = u.Email,
                Phone = u.Phone,
                Position = u.Position,
                Image = u.Image,
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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            // Lấy user theo id, nếu không tồn tại trả 404 thay vì response rỗng.
            var user = await _userService.GetById(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Chỉ trả các field an toàn cho client.
            return Ok(new UserResponse
            {
                Id = user.Id,
                Username = user.UserName,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Position = user.Position,
                Image = user.Image,
                IsActive = user.IsActive,
                UserType = user.UserType,
                Created = user.Created
            });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
        {
            // Validate body trước khi tạo user.
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
                // Controller tạo entity từ request; service sẽ hash password và lưu database.
                var user = new User
                {
                    UserName = request.Username,
                    Name = request.Name ?? request.Username,
                    Email = request.Email,
                    Phone = request.Phone,
                    Position = request.Position,
                    Image = request.Image ?? "",
                    UserType = request.UserType
                };

                var createdUser = await _userService.Create(user, request.Password);

                // Trả 201 kèm route GetById để client biết tài nguyên vừa tạo.
                return CreatedAtAction(nameof(GetById), new { id = createdUser.Id }, new UserResponse
                {
                    Id = createdUser.Id,
                    Username = createdUser.UserName,
                    Name = createdUser.Name,
                    Email = createdUser.Email,
                    Phone = createdUser.Phone,
                    Position = createdUser.Position,
                    Image = createdUser.Image,
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

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequest request)
        {
            // Body null là request không hợp lệ.
            if (request == null)
            {
                return BadRequest(new { message = "Invalid request" });
            }

            // Phải lấy entity hiện tại để update partial mà không ghi đè field không gửi lên.
            var existingUser = await _userService.GetById(id);
            if (existingUser == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Field null nghĩa là giữ nguyên dữ liệu cũ.
            existingUser.Name = request.Name ?? existingUser.Name;
            existingUser.Email = request.Email ?? existingUser.Email;
            existingUser.Phone = request.Phone ?? existingUser.Phone;
            existingUser.Position = request.Position ?? existingUser.Position;
            existingUser.Image = request.Image ?? existingUser.Image;
            existingUser.UserType = request.UserType ?? existingUser.UserType;
            existingUser.IsActive = request.IsActive ?? existingUser.IsActive;

            // Nếu request.Password có giá trị, service sẽ hash và đổi mật khẩu.
            await _userService.Update(existingUser, request.Password);

            return Ok(new UserResponse
            {
                Id = existingUser.Id,
                Username = existingUser.UserName,
                Name = existingUser.Name,
                Email = existingUser.Email,
                Phone = existingUser.Phone,
                Position = existingUser.Position,
                Image = existingUser.Image,
                IsActive = existingUser.IsActive,
                UserType = existingUser.UserType,
                Created = existingUser.Created
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            // Kiểm tra tồn tại trước khi xóa để trả đúng 404.
            var existingUser = await _userService.GetById(id);
            if (existingUser == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Hiện tại service/repository xóa vật lý user theo id.
            await _userService.Delete(id);
            return NoContent();
        }
    }

    public class UserResponse
    {
        // DTO response cố tình không có Password/Salt.
        public int Id { get; set; }
        public string Username { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Position { get; set; }
        public string Image { get; set; }
        public bool IsActive { get; set; }
        public int UserType { get; set; }
        public DateTime Created { get; set; }
    }

    public class CreateUserRequest
    {
        // DTO tạo user từ màn hình admin.
        public string Username { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Position { get; set; }
        public string? Image { get; set; }
        public int UserType { get; set; }
    }

    public class UpdateUserRequest
    {
        // DTO cập nhật user dạng partial; mọi field đều optional.
        public string? Password { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Position { get; set; }
        public string? Image { get; set; }
        public int? UserType { get; set; }
        public bool? IsActive { get; set; }
    }
}

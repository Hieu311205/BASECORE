using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace BaseCore.AuthService.Controllers
{
    /// <summary>
    /// Roles API Controller
    /// Teaching: Role-based Authorization (Bài 10, 11)
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class RolesController : ControllerBase
    {
        // Danh sách role tĩnh dùng cho demo/phân quyền cơ bản.
        // Khi chạy production nên chuyển phần này sang database để quản trị động.
        private static readonly List<RoleDto> _roles = new()
        {
            new RoleDto { Id = 1, Name = "Admin", Description = "Administrator with full access", UserType = 1 },
            new RoleDto { Id = 2, Name = "User", Description = "Regular user with limited access", UserType = 0 },
            new RoleDto { Id = 3, Name = "Manager", Description = "Manager with moderate access", UserType = 2 }
        };

        /// <summary>
        /// Get all roles
        /// </summary>
        [HttpGet]
        public IActionResult GetAll()
        {
            // Trả toàn bộ role để màn hình quản trị có thể hiển thị danh sách quyền.
            return Ok(_roles);
        }

        /// <summary>
        /// Get role by ID
        /// </summary>
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            // Tìm role theo Id nội bộ của danh sách role tĩnh.
            var role = _roles.Find(r => r.Id == id);
            if (role == null)
                return NotFound(new { message = "Role not found" });

            return Ok(role);
        }

        /// <summary>
        /// Get role by UserType
        /// </summary>
        [HttpGet("by-usertype/{userType}")]
        public IActionResult GetByUserType(int userType)
        {
            // UserType trong bảng User được map sang role để phát JWT và phân quyền.
            var role = _roles.Find(r => r.UserType == userType);
            if (role == null)
                return NotFound(new { message = "Role not found for this UserType" });

            return Ok(role);
        }

        /// <summary>
        /// Get permissions for a role
        /// </summary>
        [HttpGet("{id}/permissions")]
        public IActionResult GetPermissions(int id)
        {
            // Kiểm tra role tồn tại trước khi trả danh sách permission.
            var role = _roles.Find(r => r.Id == id);
            if (role == null)
                return NotFound(new { message = "Role not found" });

            // Permission được hard-code theo UserType: Admin đầy đủ, Manager giới hạn, User chỉ đọc.
            var permissions = role.UserType switch
            {
                1 => new[] { "users.read", "users.write", "users.delete", "products.read", "products.write", "products.delete", "orders.read", "orders.write", "orders.delete", "categories.read", "categories.write", "categories.delete", "roles.read", "roles.write" },
                2 => new[] { "users.read", "products.read", "products.write", "orders.read", "orders.write", "categories.read" },
                _ => new[] { "products.read", "orders.read", "categories.read" }
            };

            return Ok(new
            {
                role = role.Name,
                permissions
            });
        }
    }

    public class RoleDto
    {
        // Id dùng trong API roles.
        public int Id { get; set; }
        // Name là tên role sẽ hiển thị và có thể map với claim Role trong JWT.
        public string Name { get; set; } = "";
        // Description giải thích ngắn quyền hạn của role.
        public string Description { get; set; } = "";
        // UserType liên kết với field User.UserType trong database.
        public int UserType { get; set; }
    }
}

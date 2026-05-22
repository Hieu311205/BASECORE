using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace BaseCore.AuthService.Controllers
{
    // Controller quản lý vai trò (Role) trong hệ thống.
    // URL: /api/roles
    // [Authorize(Roles = "Admin")]: chỉ Admin mới được truy cập toàn bộ controller này
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class RolesController : ControllerBase
    {
        // Danh sách role được định nghĩa cứng (hardcode) trong bộ nhớ.
        // Trong thực tế, nên lưu trong database, nhưng ở đây đơn giản hóa cho mục đích học.
        private static readonly List<RoleDto> _roles = new()
        {
            new RoleDto { Id = 1, Name = "Admin",   Description = "Administrator with full access", UserType = 1 },
            new RoleDto { Id = 2, Name = "User",    Description = "Regular user with limited access", UserType = 0 },
            new RoleDto { Id = 3, Name = "Manager", Description = "Manager with moderate access", UserType = 2 }
        };

        // GET /api/roles
        // Lấy danh sách tất cả role
        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_roles);
        }

        // GET /api/roles/1
        // Lấy thông tin một role theo id
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var role = _roles.Find(r => r.Id == id);
            if (role == null)
                return NotFound(new { message = "Role not found" });

            return Ok(role);
        }

        // GET /api/roles/by-usertype/1
        // Lấy role tương ứng với một UserType cụ thể
        // Dùng để biết user với UserType=1 có role gì
        [HttpGet("by-usertype/{userType}")]
        public IActionResult GetByUserType(int userType)
        {
            var role = _roles.Find(r => r.UserType == userType);
            if (role == null)
                return NotFound(new { message = "Role not found for this UserType" });

            return Ok(role);
        }

        // GET /api/roles/1/permissions
        // Lấy danh sách quyền (permissions) của một role
        // Quyền được định nghĩa theo format: "resource.action" (ví dụ: "users.read")
        [HttpGet("{id}/permissions")]
        public IActionResult GetPermissions(int id)
        {
            var role = _roles.Find(r => r.Id == id);
            if (role == null)
                return NotFound(new { message = "Role not found" });

            // Xác định danh sách quyền dựa trên UserType
            // switch expression (C# 8+): trả về giá trị trực tiếp từ switch
            var permissions = role.UserType switch
            {
                // Admin: có tất cả quyền
                1 => new[] { "users.read", "users.write", "users.delete",
                              "products.read", "products.write", "products.delete",
                              "orders.read", "orders.write", "orders.delete",
                              "categories.read", "categories.write", "categories.delete",
                              "roles.read", "roles.write" },

                // Manager: quyền trung gian
                2 => new[] { "users.read", "products.read", "products.write",
                              "orders.read", "orders.write", "categories.read" },

                // User thường: chỉ xem (read only)
                _ => new[] { "products.read", "orders.read", "categories.read" }
            };

            return Ok(new
            {
                role = role.Name,
                permissions
            });
        }
    }

    // DTO đại diện cho một Role
    public class RoleDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public int UserType { get; set; } // 0 = User, 1 = Admin, 2 = Manager
    }
}

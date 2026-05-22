using BaseCore.Common;
using BaseCore.Entities.Audit;
using System;
using System.Collections.Generic;

namespace BaseCore.Entities
{
    // Lớp đại diện cho một vai trò (Role) trong hệ thống phân quyền.
    // Ví dụ: Admin, Manager, User...
    // Mỗi Role có thể được gán cho nhiều user và có quyền truy cập vào nhiều Module.
    public partial class Role : Entity, IAuditable
    {
        // Khởi tạo các collection để tránh NullReferenceException
        public Role()
        {
            RoleModule = new HashSet<Module>();  // Danh sách các Module mà Role này có quyền truy cập
            UserRole = new HashSet<UserRole>();  // Danh sách liên kết User-Role
        }

        // Mã định danh duy nhất dạng GUID (khác với Id integer của Entity)
        public Guid Guid { get; set; }

        // Tên role, ví dụ: "Admin", "Manager"
        public string Name { get; set; }

        // Mô tả vai trò
        public string Description { get; set; }

        // ===== Các thuộc tính audit (xem IAuditable) =====
        public string CreatedBy { get; set; }       // Người tạo
        public DateTime Created { get; set; } = DateTime.Now;  // Ngày tạo
        public string ModifiedBy { get; set; }      // Người sửa lần cuối
        public DateTime Modified { get; set; }      // Ngày sửa lần cuối
        public bool IsDeleted { get; set; }         // Xóa mềm: true = đã xóa, nhưng vẫn còn trong database

        // true = role đang hoạt động
        public bool IsActive { get; set; }

        // Loại role: 1 = System Role, 2 = Agency Role (xem RoleType enum)
        public int RoleType { get; set; }

        // Danh sách các Module mà Role này được phép truy cập
        public virtual ICollection<Module> RoleModule { get; set; }

        // Danh sách liên kết User-Role (biết role này được gán cho những user nào)
        public virtual ICollection<UserRole> UserRole { get; set; }
    }
}

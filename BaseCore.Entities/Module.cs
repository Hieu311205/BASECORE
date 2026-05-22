using BaseCore.Common;
using BaseCore.Entities.Audit;
using System;
using System.Collections.Generic;

namespace BaseCore.Entities
{
    // Module là một nhóm chức năng trong hệ thống.
    // Ví dụ: Module "Quản lý người dùng", Module "Quản lý sản phẩm"...
    // Mỗi Module có thể chứa nhiều Function (chức năng cụ thể).
    public partial class Module : Entity, IAuditable
    {
        public Module()
        {
            ModuleFunction = new HashSet<Function>(); // Danh sách chức năng thuộc module này
            UserModule = new HashSet<UserModule>();   // Danh sách user được gán module này
        }

        public Guid Guid { get; set; }

        // Tên module, ví dụ: "UserManagement", "ProductManagement"
        public string Name { get; set; }

        public string Description { get; set; }

        // ===== Các thuộc tính audit =====
        public string CreatedBy { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
        public string ModifiedBy { get; set; }
        public DateTime Modified { get; set; }
        public bool IsDeleted { get; set; }  // Xóa mềm
        public bool IsActive { get; set; }

        // Dùng cho UI: khi hiển thị danh sách module, true = đang được chọn/tích
        public bool IsChecked { get; set; }

        // Danh sách Function (chức năng) thuộc module này
        public virtual ICollection<Function> ModuleFunction { get; set; }

        // Danh sách liên kết User-Module
        public virtual ICollection<UserModule> UserModule { get; set; }
    }
}

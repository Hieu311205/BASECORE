using BaseCore.Common;
using BaseCore.Entities.Audit;
using System;
using System.Collections.Generic;

namespace BaseCore.Entities
{
    // Function là một chức năng cụ thể trong hệ thống phân quyền.
    // Ví dụ: "View", "Create", "Edit", "Delete"
    // Mỗi Function thuộc về một Module thông qua bảng ModuleFunction.
    public partial class Function : Entity, IAuditable
    {
        public Function()
        {
            // Danh sách liên kết Module-Function (function này thuộc những module nào)
            ModuleFunction = new HashSet<ModuleFunction>();
        }

        // Tên chức năng, ví dụ: "UserManagement_View", "UserManagement_Create"
        public string Name { get; set; }

        public string Description { get; set; }

        // ===== Các thuộc tính audit =====
        public string CreatedBy { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
        public string ModifiedBy { get; set; }
        public DateTime Modified { get; set; }
        public bool IsDeleted { get; set; }  // Xóa mềm
        public bool IsActive { get; set; }

        // Dùng cho UI: true = chức năng đang được chọn/tích trong form phân quyền
        public bool IsChecked { get; set; }

        // Danh sách liên kết Module-Function
        public virtual ICollection<ModuleFunction> ModuleFunction { get; set; }
    }
}

using BaseCore.Common;
using BaseCore.Entities.Audit;
using System;
using System.Collections.Generic;

namespace BaseCore.Entities
{
    // Lớp đại diện cho nhóm vai trò theo cơ quan/đại lý (Agency).
    // Cho phép tạo nhóm role riêng cho từng cơ quan/chi nhánh khác nhau.
    // Ví dụ: Agency A có nhóm role riêng, Agency B có nhóm role khác.
    public partial class GroupRoleAgency : Entity, IAuditable
    {
        public GroupRoleAgency()
        {
            // Danh sách module mà nhóm role này có quyền truy cập
            RoleModule = new HashSet<Module>();
        }

        public Guid Guid { get; set; }

        // Id của cơ quan/đại lý sở hữu nhóm role này
        public string AgencyId { get; set; }

        // Tên nhóm role
        public string Name { get; set; }

        public string Description { get; set; }

        // ===== Các thuộc tính audit =====
        public string CreatedBy { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
        public string ModifiedBy { get; set; }
        public DateTime Modified { get; set; }
        public bool IsDeleted { get; set; }  // Xóa mềm

        // Dùng ? (nullable) để có thể chưa xác định trạng thái
        public bool? IsActive { get; set; }

        // Loại role: 1 = System Role, 2 = Agency Role
        public int RoleType { get; set; }

        // Danh sách module mà nhóm role này được phép truy cập
        public virtual ICollection<Module> RoleModule { get; set; }
    }
}

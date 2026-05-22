using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using BaseCore.Common;
using BaseCore.Entities.Audit;
using System;

namespace BaseCore.Entities
{
    // Bảng trung gian 3 chiều: Role ↔ Module ↔ Function.
    // Xác định Role nào được phép thực hiện Function nào trong Module nào.
    // Đây là trái tim của hệ thống phân quyền chi tiết (fine-grained authorization).
    // Ví dụ: Role "Manager" được phép "View" trong Module "UserManagement"
    //        nhưng không được phép "Delete".
    public partial class RoleModuleFunction : Entity, IAuditable
    {
        public Guid Guid { get; set; }

        // Id của Role được cấp quyền
        [BsonRepresentation(BsonType.ObjectId)]
        public string RoleId { get; set; }

        // Id của liên kết Module-Function (xác định chức năng cụ thể trong module)
        [BsonRepresentation(BsonType.ObjectId)]
        public string ModuleFunctionId { get; set; }

        // ===== Các thuộc tính audit =====
        public string CreatedBy { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
        public string ModifiedBy { get; set; }
        public DateTime Modified { get; set; }
        public bool IsDeleted { get; set; }  // Xóa mềm

        // true = quyền này đang được kích hoạt
        public bool IsActive { get; set; }
    }
}

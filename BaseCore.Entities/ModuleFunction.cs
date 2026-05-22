using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using BaseCore.Common;
using BaseCore.Entities.Audit;
using System;
using System.Collections.Generic;

namespace BaseCore.Entities
{
    // Bảng trung gian nối Module và Function.
    // Xác định chức năng nào thuộc về module nào.
    // Ví dụ: Module "UserManagement" có các function: View, Create, Edit, Delete
    public partial class ModuleFunction : Entity, IAuditable
    {
        public ModuleFunction()
        {
            // Danh sách RoleModuleFunction: role nào được dùng chức năng này trong module này
            RoleModuleFunction = new HashSet<RoleModuleFunction>();
        }

        public Guid Guid { get; set; }

        // Id của module chứa chức năng này
        [BsonRepresentation(BsonType.ObjectId)]
        public string ModuleId { get; set; }

        // Id của chức năng cụ thể
        [BsonRepresentation(BsonType.ObjectId)]
        public string FunctionId { get; set; }

        // ===== Các thuộc tính audit =====
        public string CreatedBy { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
        public string ModifiedBy { get; set; }
        public DateTime Modified { get; set; }
        public bool IsDeleted { get; set; }  // Xóa mềm

        // Navigation properties
        public virtual Function Function { get; set; }   // Thông tin chức năng
        public virtual Module Module { get; set; }        // Thông tin module chứa chức năng
        public virtual ICollection<RoleModuleFunction> RoleModuleFunction { get; set; }  // Danh sách role có quyền dùng chức năng này
    }
}

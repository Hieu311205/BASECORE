using MongoDB.Bson;
using BaseCore.Common;
using BaseCore.Entities.Audit;
using System;

namespace BaseCore.Entities
{
    // Bảng trung gian nối User và Module.
    // Cho phép cấp quyền truy cập module trực tiếp cho một user cụ thể
    // (ngoài việc cấp quyền thông qua Role).
    public partial class UserModule : Entity, IAuditable
    {
        public Guid Guid { get; set; }

        // Id của user được cấp quyền module
        public ObjectId UserId { get; set; }

        // Id của module được cấp
        public ObjectId ModuleId { get; set; }

        // ===== Các thuộc tính audit =====
        public string CreatedBy { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
        public string ModifiedBy { get; set; }
        public DateTime Modified { get; set; }
        public bool IsDeleted { get; set; }  // Xóa mềm

        // Navigation properties: truy cập thông tin Module và User liên quan
        public virtual Module Module { get; set; }
        public virtual User User { get; set; }
    }
}

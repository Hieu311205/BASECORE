using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using BaseCore.Common;
using BaseCore.Entities.Audit;
using System;
using System.Collections.Generic;

namespace BaseCore.Entities
{
    // Bảng trung gian (junction table) nối User và Role.
    // Quan hệ nhiều-nhiều: 1 User có thể có nhiều Role, 1 Role có thể gán cho nhiều User.
    // Ví dụ: user "nguyen_van_a" có cả role "Manager" lẫn role "User"
    public partial class UserRole : Entity, IAuditable
    {
        public UserRole()
        {
            Roles = new HashSet<Role>();    // Danh sách role liên quan
            Users = new HashSet<User>();    // Danh sách user liên quan
        }

        public Guid Guid { get; set; }

        // Id của user được gán role
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; }

        // Id của role được gán
        [BsonRepresentation(BsonType.ObjectId)]
        public string RoleId { get; set; }

        // true = liên kết này đang hoạt động
        public bool IsActive { get; set; }

        // Id kết hợp User-Role dạng ObjectId (dùng nội bộ MongoDB)
        public ObjectId? RoleUserId { get; set; }

        // ===== Các thuộc tính audit =====
        public string CreatedBy { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
        public string ModifiedBy { get; set; }
        public DateTime Modified { get; set; }
        public bool IsDeleted { get; set; }  // Xóa mềm

        // Navigation properties
        public virtual ICollection<Role> Roles { get; set; }
        public virtual ICollection<User> Users { get; set; }
    }
}

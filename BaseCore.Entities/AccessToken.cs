using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using BaseCore.Common;
using System;
using System.Collections.Generic;

namespace BaseCore.Entities
{
    // Lớp lưu trữ thông tin token đăng nhập của user.
    // Khi user đăng nhập, hệ thống tạo một AccessToken và lưu vào đây.
    // Dùng để kiểm tra token còn hợp lệ không (chưa hết hạn).
    public partial class AccessToken : Entity
    {
        // Mã định danh duy nhất của token
        public Guid Guid { get; set; }

        // Id của user sở hữu token này (lưu dạng ObjectId của MongoDB)
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; }

        // Chuỗi JWT token thực sự được gửi trong header Authorization
        public string Token { get; set; }

        // Thời điểm token hết hạn
        // Sau thời điểm này, token không còn hợp lệ, user phải đăng nhập lại
        public DateTime Expirated { get; set; }

        // Người tạo token (thường là username của user đó)
        public string CreatedBy { get; set; }

        // Thời điểm tạo token
        public DateTime Created { get; set; } = DateTime.Now;

        // Danh sách Role của user (thường để biết quyền hạn khi dùng token)
        public virtual ICollection<Role> Roles { get; set; }

        // Thông tin user sở hữu token này
        public virtual User User { get; set; }
    }
}

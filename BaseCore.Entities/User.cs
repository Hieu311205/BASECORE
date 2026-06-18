using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace BaseCore.Entities
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public int Id { get; set; }
        public string Name { get; set; } = "";
        //public string Guid { get; set; }
        // UserName là định danh đăng nhập và được cấu hình unique trong DbContext.
        public string UserName { get; set; } = "";
        // Password lưu hash; dữ liệu cũ có thể còn plain text nên service có nhánh tương thích.
        public string Password { get; set; } = "";
        // Salt dùng để kiểm tra password hash.
        public byte[] Salt { get; set; } = Array.Empty<byte>();
        public string Contact { get; set; } = "";
        public string Email { get; set; } = "";
        public string Phone { get; set; } = "";
        public string Position { get; set; } = "";
        public string Image { get; set; } = "";
        public bool IsActive { get; set; } = true;
        // UserType được map sang role khi phát JWT: 1 = Admin, giá trị khác = User.
        public int UserType { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
    }
}

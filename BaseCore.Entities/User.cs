using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace BaseCore.Entities
{
    // Đây là lớp đại diện cho bảng Users trong database.
    // Mỗi object User tương ứng với một dòng trong bảng Users.
    public class User
    {
        // [BsonId]: đây là khóa chính (_id) khi dùng MongoDB
        // [BsonRepresentation]: cho phép lưu dạng ObjectId trong MongoDB nhưng code C# dùng int
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public int Id { get; set; }

        // Họ tên đầy đủ của người dùng
        public string Name { get; set; } = "";

        // Tên đăng nhập (username), phải là duy nhất trong hệ thống
        public string UserName { get; set; } = "";

        // Mật khẩu đã được mã hóa (hash), không lưu mật khẩu thô
        public string Password { get; set; } = "";

        // Salt là chuỗi byte ngẫu nhiên dùng để mã hóa mật khẩu (tăng bảo mật)
        // Mỗi user có một salt riêng để cùng mật khẩu nhưng hash khác nhau
        public byte[] Salt { get; set; } = Array.Empty<byte>();

        // Thông tin liên hệ bổ sung
        public string Contact { get; set; } = "";
        public string Email { get; set; } = "";
        public string Phone { get; set; } = "";

        // Chức vụ / vị trí trong công ty
        public string Position { get; set; } = "";

        // Đường dẫn ảnh đại diện
        public string Image { get; set; } = "";

        // true = tài khoản đang hoạt động, false = đã bị khóa/vô hiệu hóa
        public bool IsActive { get; set; } = true;

        // Loại người dùng: 0 = User thường, 1 = Admin, 2 = Manager
        public int UserType { get; set; }

        // Thời điểm tạo tài khoản, mặc định là lúc khởi tạo object
        public DateTime Created { get; set; } = DateTime.Now;
    }
}

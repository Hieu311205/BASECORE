using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace BaseCore.Common
{
    // Lớp cơ sở (base class) mà nhiều Entity khác kế thừa.
    // Cung cấp các thuộc tính chung cho tất cả entity trong hệ thống.
    // Được thiết kế cho MongoDB (dùng ObjectId làm Id).
    public class Entity
    {
        // [BsonRepresentation]: lưu dạng ObjectId trong MongoDB, nhưng code C# đọc/ghi dạng string
        // ObjectId.GenerateNewId(): tạo id mới tự động mỗi khi khởi tạo một Entity mới
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

        // Thời điểm tạo bản ghi (mặc định là DateTime.MinValue, cần gán lại)
        public DateTime CreatedDateTime { get; set; } = new DateTime();

        // Tên user tạo bản ghi
        public string CreatedUser { get; set; }
    }
}

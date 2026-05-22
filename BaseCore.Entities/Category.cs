using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BaseCore.Entities
{
    // Lớp đại diện cho danh mục sản phẩm.
    // Tương ứng với bảng Categories trong database.
    // Ví dụ: Electronics, Clothing, Books...
    public class Category
    {
        // Khóa chính, tự động tăng
        [BsonId]
        public int Id { get; set; }

        // Tên danh mục, ví dụ: "Electronics"
        public string Name { get; set; }

        // Mô tả ngắn về danh mục
        public string Description { get; set; }
    }
}

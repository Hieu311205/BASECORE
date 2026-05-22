using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BaseCore.Entities
{
    // Lớp đại diện cho một sản phẩm trong hệ thống.
    // Tương ứng với bảng Products trong database.
    public class Product
    {
        // Khóa chính, tự động tăng khi tạo mới
        [BsonId]
        public int Id { get; set; }

        // Tên sản phẩm, ví dụ: "Laptop Dell XPS 15"
        public string Name { get; set; }

        // Giá bán, kiểu decimal để đảm bảo độ chính xác cho tiền tệ
        public decimal Price { get; set; }

        // Số lượng tồn kho hiện tại
        // Khi đặt hàng, số này sẽ giảm; khi hủy đơn, số này sẽ tăng lại
        public int Stock { get; set; }

        // Đường dẫn URL ảnh sản phẩm
        public string ImageUrl { get; set; }

        // Mô tả chi tiết sản phẩm
        public string Description { get; set; }

        // Khóa ngoại trỏ đến bảng Categories
        // Mỗi sản phẩm thuộc về đúng 1 danh mục
        public int CategoryId { get; set; }

        // [BsonIgnore]: bỏ qua khi serialize/deserialize với MongoDB
        // Đây là navigation property, cho phép truy cập thông tin danh mục từ sản phẩm
        // Ví dụ: product.Category.Name → lấy tên danh mục
        [BsonIgnore]
        public Category Category { get; set; }
    }
}

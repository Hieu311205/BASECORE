using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BaseCore.Entities
{
    public class Product
    {
        [BsonId]
        public int Id { get; set; }

        // Thông tin hiển thị chính của sản phẩm trên trang bán hàng.
        public string Name { get; set; }

        public decimal Price { get; set; }

        // Stock được trừ khi tạo đơn và hoàn lại khi hủy đơn.
        public int Stock { get; set; }

        public string ImageUrl { get; set; }

        public string Description { get; set; }

        public int CategoryId { get; set; }

        // SupplierId nullable vì sản phẩm có thể chưa gắn nhà cung cấp.
        public int? SupplierId { get; set; }

        // SKU/Slug dùng cho quản trị và URL thân thiện; được cấu hình unique trong DbContext.
        public string? Sku { get; set; }

        public string? Slug { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }

        // Soft delete: sản phẩm bị xóa sẽ không hiển thị nhưng vẫn giữ dữ liệu tham chiếu.
        public bool IsDeleted { get; set; }

        [BsonIgnore]
        // Navigation property EF Core dùng để Include thông tin danh mục.
        public Category Category { get; set; }

        [BsonIgnore]
        // Navigation property tới nhà cung cấp; có thể null.
        public Supplier? Supplier { get; set; }
    }
}

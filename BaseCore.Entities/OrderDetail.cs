//using MongoDB.Bson.Serialization.Attributes;

//namespace BaseCore.Entities
//{
//    public class OrderDetail
//    {
//        [BsonId]
//        public int Id { get; set; }

//        public int OrderId { get; set; }

//        public int ProductId { get; set; }

//        public int Quantity { get; set; }

//        public decimal UnitPrice { get; set; }

//        [BsonIgnore]
//        public Order Order { get; set; }

//        [BsonIgnore]
//        public Product Product { get; set; }
//    }
//}
using System.ComponentModel.DataAnnotations.Schema;

namespace BaseCore.Entities
{
    // Lớp đại diện cho một dòng trong đơn hàng (chi tiết đơn hàng).
    // Tương ứng với bảng OrderDetails trong database.
    // Ví dụ: đơn hàng #1 gồm 2 sản phẩm → 2 dòng OrderDetail
    public class OrderDetail
    {
        // Khóa chính
        public int Id { get; set; }

        // Khóa ngoại trỏ đến bảng Orders
        // Biết dòng chi tiết này thuộc đơn hàng nào
        public int OrderId { get; set; }

        // Khóa ngoại trỏ đến bảng Products
        // Biết dòng chi tiết này là sản phẩm nào
        public int ProductId { get; set; }

        // Số lượng đặt mua
        public int Quantity { get; set; }

        // Đơn giá tại thời điểm đặt hàng
        // Lưu riêng vì giá sản phẩm có thể thay đổi về sau,
        // nhưng lịch sử đơn hàng phải giữ nguyên giá cũ
        public decimal UnitPrice { get; set; }

        // Navigation property: truy cập thông tin đơn hàng chứa dòng này
        [ForeignKey("OrderId")]
        public Order? Order { get; set; }

        // Navigation property: truy cập thông tin sản phẩm trong dòng này
        [ForeignKey("ProductId")]
        public Product? Product { get; set; }
    }
}

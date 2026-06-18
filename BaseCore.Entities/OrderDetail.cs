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
    public class OrderDetail
    {
        public int Id { get; set; }

        public int OrderId { get; set; }

        public int ProductId { get; set; }

        // Số lượng sản phẩm trong dòng đơn hàng.
        public int Quantity { get; set; }

        // Giá tại thời điểm đặt hàng, giúp lịch sử đơn không đổi khi Product.Price thay đổi.
        public decimal UnitPrice { get; set; }

        // Navigation tới Order theo khóa ngoại OrderId.
        [ForeignKey("OrderId")]
        public Order? Order { get; set; }

        // Navigation tới Product theo khóa ngoại ProductId.
        [ForeignKey("ProductId")]
        public Product? Product { get; set; }
    }
}

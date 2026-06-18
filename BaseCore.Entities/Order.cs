//using MongoDB.Bson;
//using MongoDB.Bson.Serialization.Attributes;
//using System;
//using System.Collections.Generic;

//namespace BaseCore.Entities
//{
//    public class Order
//    {
//        [BsonId]
//        public int Id { get; set; }

//        [BsonRepresentation(BsonType.String)]
//        public Guid UserId { get; set; }

//        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

//        public decimal TotalAmount { get; set; }

//        public string Status { get; set; } // Pending, Completed, Cancelled

//        public string ShippingAddress { get; set; }

//        public List<OrderDetail> OrderDetails { get; set; }
//    }
//}
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BaseCore.Entities
{
    public class Order
    {
        public int Id { get; set; }

        // UserId liên kết đơn hàng với tài khoản đặt hàng.
        public int UserId { get; set; }

        // Navigation property để EF Core có thể load thông tin user khi cần.
        [ForeignKey("UserId")]
        public User? User { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        // Tổng tiền được tính từ các OrderDetail tại thời điểm tạo đơn.
        public decimal TotalAmount { get; set; }

        // Trạng thái nghiệp vụ: Pending, Completed, Cancelled...
        public string Status { get; set; } = "";

        public string ShippingAddress { get; set; } = "";

        public string? RecipientName { get; set; }

        public string? RecipientPhone { get; set; }

        public string PaymentMethod { get; set; } = "COD";

        // Trạng thái thanh toán tách riêng trạng thái xử lý đơn.
        public string PaymentStatus { get; set; } = "Unpaid";

        public DateTime? UpdatedAt { get; set; }

        // Quan hệ 1-n: một đơn hàng có nhiều dòng chi tiết sản phẩm.
        public List<OrderDetail> OrderDetails { get; set; } = new();
    }
}

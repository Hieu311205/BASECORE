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
    // Lớp đại diện cho một đơn hàng.
    // Tương ứng với bảng Orders trong database.
    // Mỗi đơn hàng thuộc về một user và có nhiều OrderDetail (chi tiết từng sản phẩm).
    public class Order
    {
        // Khóa chính, tự động tăng
        public int Id { get; set; }

        // Khóa ngoại trỏ đến bảng Users
        // Biết đơn hàng này của user nào
        public int UserId { get; set; }

        // Navigation property: truy cập thông tin user của đơn hàng
        // [ForeignKey("UserId")]: EF Core biết UserId là khóa ngoại liên kết với User
        // Dấu ? nghĩa là có thể null (khi chưa load dữ liệu từ database)
        [ForeignKey("UserId")]
        public User? User { get; set; }

        // Ngày giờ đặt hàng, mặc định là thời điểm tạo (UTC để tránh lệch timezone)
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        // Tổng tiền của đơn hàng (tính bằng cách cộng UnitPrice * Quantity của từng dòng)
        public decimal TotalAmount { get; set; }

        // Trạng thái đơn hàng: "Pending" (chờ xử lý), "Completed" (hoàn thành), "Cancelled" (đã hủy)
        public string Status { get; set; } = "";

        // Địa chỉ giao hàng
        public string ShippingAddress { get; set; } = "";

        // Danh sách chi tiết đơn hàng (mỗi dòng là 1 sản phẩm trong đơn)
        // Quan hệ 1-n: 1 Order có nhiều OrderDetail
        public List<OrderDetail> OrderDetails { get; set; } = new();
    }
}

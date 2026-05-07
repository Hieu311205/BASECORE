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

        public int UserId { get; set; }

        // 🔥 THÊM DÒNG NÀY (QUAN TRỌNG)
        [ForeignKey("UserId")]
        public User? User { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = "";

        public string ShippingAddress { get; set; } = "";

        // 🔥 Quan hệ 1-n
        public List<OrderDetail> OrderDetails { get; set; } = new();
    }
}
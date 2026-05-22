//using MongoDB.Driver;
//using BaseCore.Entities;
//using BaseCore.Repository;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Threading.Tasks;

//namespace BaseCore.Services.inter
//{
//    public class OrderService : IOrderService
//    {
//        ...
//    }
//}
using BaseCore.Entities;
using BaseCore.Repository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseCore.Services
{
    // Lớp xử lý nghiệp vụ liên quan đến đơn hàng.
    public class OrderService : IOrderService
    {
        private readonly MySqlDbContext _context;

        public OrderService(MySqlDbContext context)
        {
            _context = context;
        }

        // Tạo đơn hàng mới
        // Tự động gán ngày đặt hàng (UTC) và trạng thái ban đầu là "Pending"
        public async Task<Order> CreateOrderAsync(Order order)
        {
            order.OrderDate = DateTime.UtcNow; // Lưu theo UTC để tránh lệch timezone
            order.Status = "Pending";          // Trạng thái mặc định khi mới tạo

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return order;
        }

        // Lấy tất cả đơn hàng của một user
        // Include + ThenInclude: Load chuỗi quan hệ Orders → OrderDetails → Products
        // (tương đương JOIN nhiều bảng trong SQL)
        public async Task<List<Order>> GetOrdersByUserIdAsync(int userId)
        {
            var orders = await _context.Orders
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate) // Đơn mới nhất lên đầu
                .Include(o => o.OrderDetails)        // Load chi tiết đơn hàng
                    .ThenInclude(d => d.Product)     // Trong chi tiết, load luôn thông tin sản phẩm
                .ToListAsync();

            return orders;
        }

        // Lấy chi tiết một đơn hàng theo id
        // Include + ThenInclude để có đủ thông tin: đơn hàng + từng dòng + sản phẩm trong từng dòng
        public async Task<Order?> GetOrderByIdAsync(int id)
        {
            return await _context.Orders
                .Where(o => o.Id == id)
                .Include(o => o.OrderDetails)    // Lấy danh sách dòng chi tiết
                    .ThenInclude(d => d.Product) // Trong mỗi dòng, lấy thông tin sản phẩm
                .FirstOrDefaultAsync();
        }
    }
}

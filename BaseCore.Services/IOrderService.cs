using BaseCore.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaseCore.Services
{
    // Interface định nghĩa các chức năng của OrderService.
    // Quản lý đơn hàng: tạo đơn, xem đơn của user, xem chi tiết đơn.
    public interface IOrderService
    {
        // Tạo đơn hàng mới
        // Order đã được chuẩn bị từ Controller (có UserId, OrderDetails...)
        Task<Order> CreateOrderAsync(Order order);

        // Lấy tất cả đơn hàng của một user, sắp xếp mới nhất lên đầu
        Task<List<Order>> GetOrdersByUserIdAsync(System.Int32 userId);

        // Lấy thông tin chi tiết một đơn hàng (kèm danh sách sản phẩm đã mua)
        Task<Order> GetOrderByIdAsync(int id);
    }
}

using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository.EFCore
{
    // Interface đặc thù cho Order
    public interface IOrderRepositoryEF : IRepository<Order>
    {
        // Lấy tất cả đơn hàng của một user, sắp xếp mới nhất lên đầu
        Task<List<Order>> GetByUserAsync(int userId);

        // Lấy đơn hàng kèm chi tiết (OrderDetails)
        Task<Order?> GetWithDetailsAsync(int orderId);
    }

    // Repository cụ thể cho Order
    public class OrderRepositoryEF : Repository<Order>, IOrderRepositoryEF
    {
        public OrderRepositoryEF(MySqlDbContext context) : base(context)
        {
        }

        // Lấy tất cả đơn hàng của user, sắp xếp theo ngày đặt mới nhất lên đầu
        public async Task<List<Order>> GetByUserAsync(int userId)
        {
            return await _dbSet
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate) // Đơn mới nhất hiển thị đầu tiên
                .ToListAsync();
        }

        // Lấy đơn hàng theo id (phiên bản đơn giản, chưa include OrderDetails)
        public async Task<Order?> GetWithDetailsAsync(int orderId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(o => o.Id == orderId);
        }
    }

    // Interface đặc thù cho OrderDetail
    public interface IOrderDetailRepositoryEF : IRepository<OrderDetail>
    {
        // Lấy tất cả chi tiết của một đơn hàng, kèm thông tin sản phẩm
        Task<List<OrderDetail>> GetByOrderAsync(int orderId);
    }

    // Repository cụ thể cho OrderDetail
    public class OrderDetailRepositoryEF : Repository<OrderDetail>, IOrderDetailRepositoryEF
    {
        public OrderDetailRepositoryEF(MySqlDbContext context) : base(context)
        {
        }

        // Lấy tất cả dòng chi tiết của một đơn hàng
        // Include(od => od.Product): load luôn thông tin sản phẩm kèm theo mỗi dòng
        public async Task<List<OrderDetail>> GetByOrderAsync(int orderId)
        {
            return await _dbSet
                .Where(od => od.OrderId == orderId)
                .Include(od => od.Product) // Eager loading: lấy Product luôn trong cùng 1 query
                .ToListAsync();
        }
    }
}

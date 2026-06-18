using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository.EFCore
{
    /// <summary>
    /// Order Repository using Entity Framework Core
    /// </summary>
    public interface IOrderRepositoryEF : IRepository<Order>
    {
        Task<List<Order>> GetByUserAsync(int userId);
        Task<Order?> GetWithDetailsAsync(int orderId);
        Task<(List<Order> Items, int TotalCount)> SearchAsync(string? keyword, string? status, int page, int pageSize, string? paymentStatus = null);
    }

    public class OrderRepositoryEF : Repository<Order>, IOrderRepositoryEF
    {
        public OrderRepositoryEF(MySqlDbContext context) : base(context)
        {
        }

        public async Task<List<Order>> GetByUserAsync(int userId)
        {
            // Người dùng chỉ xem các đơn của chính mình, sắp xếp đơn mới trước.
            return await _dbSet
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<Order?> GetWithDetailsAsync(int orderId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(o => o.Id == orderId);
        }

        public async Task<(List<Order> Items, int TotalCount)> SearchAsync(string? keyword, string? status, int page, int pageSize, string? paymentStatus = null)
        {
            // Chặn page/pageSize không hợp lệ để Skip/Take không sinh lỗi runtime.
            page = page < 1 ? 1 : page;
            pageSize = pageSize < 1 ? 10 : pageSize;

            var query = _dbSet.AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                // Admin có thể tìm theo mã đơn, mã user hoặc thông tin người nhận.
                var normalizedKeyword = keyword.Trim().ToLower();
                query = query.Where(o =>
                    o.Id.ToString().Contains(normalizedKeyword) ||
                    o.UserId.ToString().Contains(normalizedKeyword) ||
                    (o.RecipientName != null && o.RecipientName.ToLower().Contains(normalizedKeyword)) ||
                    (o.RecipientPhone != null && o.RecipientPhone.ToLower().Contains(normalizedKeyword)) ||
                    (o.ShippingAddress != null && o.ShippingAddress.ToLower().Contains(normalizedKeyword)));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                // So sánh trạng thái theo dạng normalize để tránh lệch hoa/thường từ query string.
                var normalizedStatus = status.Trim().ToLower();
                query = query.Where(o => o.Status.ToLower() == normalizedStatus);
            }

            // TotalCount được tính sau filter nhưng trước pagination.
            if (!string.IsNullOrWhiteSpace(paymentStatus))
            {
                var normalizedPaymentStatus = paymentStatus.Trim().ToLower();
                query = query.Where(o => o.PaymentStatus != null && o.PaymentStatus.ToLower() == normalizedPaymentStatus);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(o => o.OrderDate)
                .ThenByDescending(o => o.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }

    /// <summary>
    /// OrderDetail Repository using Entity Framework Core
    /// </summary>
    public interface IOrderDetailRepositoryEF : IRepository<OrderDetail>
    {
        Task<List<OrderDetail>> GetByOrderAsync(int orderId);
    }

    public class OrderDetailRepositoryEF : Repository<OrderDetail>, IOrderDetailRepositoryEF
    {
        public OrderDetailRepositoryEF(MySqlDbContext context) : base(context)
        {
        }

        public async Task<List<OrderDetail>> GetByOrderAsync(int orderId)
        {
            // Include Product để màn hình chi tiết đơn có thể hiển thị tên/ảnh sản phẩm.
            return await _dbSet
                .Where(od => od.OrderId == orderId)
                .Include(od => od.Product)
                .ToListAsync();
        }
    }
}

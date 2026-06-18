using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository.EFCore
{
    public interface ISupplierRepositoryEF : IRepository<Supplier>
    {
        Task<(List<Supplier> Suppliers, int TotalCount)> SearchAsync(
            string? keyword,
            bool? isActive,
            int page,
            int pageSize
        );
    }

    public class SupplierRepositoryEF : Repository<Supplier>, ISupplierRepositoryEF
    {
        public SupplierRepositoryEF(MySqlDbContext context) : base(context)
        {
        }

        public async Task<(List<Supplier> Suppliers, int TotalCount)> SearchAsync(
            string? keyword,
            bool? isActive,
            int page,
            int pageSize
        )
        {
            // Soft delete: chỉ query supplier chưa bị xóa khỏi nghiệp vụ.
            var query = _dbSet.Where(s => !s.IsDeleted).AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
            {
                // Keyword tìm trên các thông tin thường dùng khi tra cứu nhà cung cấp.
                keyword = keyword.ToLower();

                query = query.Where(s =>
                    s.Name.ToLower().Contains(keyword) ||
                    (s.Phone != null && s.Phone.ToLower().Contains(keyword)) ||
                    (s.Email != null && s.Email.ToLower().Contains(keyword)) ||
                    (s.Address != null && s.Address.ToLower().Contains(keyword))
                );
            }

            if (isActive.HasValue)
            {
                // Cho phép frontend lọc nhà cung cấp đang hoạt động hoặc đã tạm ngưng.
                query = query.Where(s => s.IsActive == isActive.Value);
            }

            // Đếm trước phân trang để trả metadata đầy đủ cho bảng dữ liệu.
            var totalCount = await query.CountAsync();

            var suppliers = await query
                .OrderByDescending(s => s.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (suppliers, totalCount);
        }
    }
}

using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository.EFCore
{
    // Interface đặc thù cho Product, kế thừa toàn bộ từ IRepository<Product>
    // và bổ sung thêm các method riêng của Product
    public interface IProductRepositoryEF : IRepository<Product>
    {
        // Tìm kiếm sản phẩm theo từ khóa và danh mục, có phân trang
        Task<(List<Product> Products, int TotalCount)> SearchAsync(string? keyword, int? categoryId, int page, int pageSize);

        // Lấy tất cả sản phẩm thuộc một danh mục cụ thể
        Task<List<Product>> GetByCategoryAsync(int categoryId);
    }

    // Lớp Repository cụ thể cho Product
    // Kế thừa Repository<Product> (có sẵn CRUD) và implement IProductRepositoryEF
    public class ProductRepositoryEF : Repository<Product>, IProductRepositoryEF
    {
        public ProductRepositoryEF(MySqlDbContext context) : base(context)
        {
        }

        // Tìm kiếm sản phẩm với nhiều điều kiện lọc và phân trang
        public async Task<(List<Product> Products, int TotalCount)> SearchAsync(string? keyword, int? categoryId, int page, int pageSize)
        {
            // Include(p => p.Category): khi lấy Product, load luôn thông tin Category kèm theo
            // AsQueryable(): chuyển thành IQueryable để có thể thêm điều kiện lọc linh hoạt
            var query = _dbSet.Include(p => p.Category).AsQueryable();

            // Lọc theo từ khóa (tìm trong tên hoặc mô tả, không phân biệt hoa thường)
            if (!string.IsNullOrEmpty(keyword))
            {
                keyword = keyword.ToLower();
                query = query.Where(p =>
                    p.Name.ToLower().Contains(keyword) ||
                    (p.Description != null && p.Description.ToLower().Contains(keyword)));
            }

            // Lọc theo danh mục (nếu có chỉ định)
            if (categoryId.HasValue && categoryId > 0)
            {
                query = query.Where(p => p.CategoryId == categoryId);
            }

            // Đếm tổng số trước khi phân trang
            var totalCount = await query.CountAsync();

            // Sắp xếp theo Id giảm dần (mới nhất lên đầu), rồi phân trang
            var products = await query
                .OrderByDescending(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (products, totalCount);
        }

        // Lấy tất cả sản phẩm thuộc một danh mục, kèm thông tin danh mục
        public async Task<List<Product>> GetByCategoryAsync(int categoryId)
        {
            return await _dbSet
                .Where(p => p.CategoryId == categoryId)
                .Include(p => p.Category) // Load thông tin danh mục kèm theo
                .ToListAsync();
        }
    }
}

using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository.EFCore
{
    /// <summary>
    /// Product Repository using Entity Framework Core
    /// </summary>
    public interface IProductRepositoryEF : IRepository<Product>
    {
        Task<(List<Product> Products, int TotalCount)> SearchAsync(string? keyword, int? categoryId, bool? isActive, int page, int pageSize, int? supplierId = null, int? minStock = null, int? maxStock = null, decimal? minPrice = null, decimal? maxPrice = null);
        Task<List<Product>> GetByCategoryAsync(int categoryId);
    }

    public class ProductRepositoryEF : Repository<Product>, IProductRepositoryEF
    {
        public ProductRepositoryEF(MySqlDbContext context) : base(context)
        {
        }

        public async Task<(List<Product> Products, int TotalCount)> SearchAsync(string? keyword, int? categoryId, bool? isActive, int page, int pageSize, int? supplierId = null, int? minStock = null, int? maxStock = null, decimal? minPrice = null, decimal? maxPrice = null)
        {
            // Include Category/Supplier để API trả đủ thông tin liên quan cho danh sách sản phẩm.
            var query = _dbSet
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Where(p => !p.IsDeleted)
                .AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
            {
                // Chuẩn hóa keyword để tìm kiếm không phân biệt hoa/thường trên các trường chính.
                keyword = keyword.ToLower();
                query = query.Where(p =>
                    p.Name.ToLower().Contains(keyword) ||
                    (p.Sku != null && p.Sku.ToLower().Contains(keyword)) ||
                    (p.Slug != null && p.Slug.ToLower().Contains(keyword)) ||
                    (p.Description != null && p.Description.ToLower().Contains(keyword)));
            }

            if (categoryId.HasValue && categoryId > 0)
            {
                // categoryId <= 0 được xem như không lọc danh mục.
                query = query.Where(p => p.CategoryId == categoryId);
            }

            if (supplierId.HasValue && supplierId > 0)
            {
                query = query.Where(p => p.SupplierId == supplierId);
            }

            if (isActive.HasValue)
            {
                query = query.Where(p => p.IsActive == isActive.Value);
            }

            if (minStock.HasValue)
            {
                query = query.Where(p => p.Stock >= minStock.Value);
            }

            if (maxStock.HasValue)
            {
                query = query.Where(p => p.Stock <= maxStock.Value);
            }

            if (minPrice.HasValue)
            {
                query = query.Where(p => p.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= maxPrice.Value);
            }

            // Đếm trước khi phân trang để client biết tổng số kết quả sau khi lọc.
            var totalCount = await query.CountAsync();

            var products = await query
                // Sản phẩm mới nhất được ưu tiên hiển thị trước.
                .OrderByDescending(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (products, totalCount);
        }

        public async Task<List<Product>> GetByCategoryAsync(int categoryId)
        {
            return await _dbSet
                .Where(p => !p.IsDeleted)
                .Where(p => p.CategoryId == categoryId)
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .ToListAsync();
        }
    }
}

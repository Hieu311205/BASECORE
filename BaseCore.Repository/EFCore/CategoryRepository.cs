using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository.EFCore
{
    /// <summary>
    /// Category Repository using Entity Framework Core
    /// </summary>
    public interface ICategoryRepositoryEF : IRepository<Category>
    {
        Task<Category?> GetByNameAsync(string name);
        Task<(List<Category> Categories, int TotalCount)> SearchAsync(string? keyword, int page, int pageSize);
    }

    public class CategoryRepositoryEF : Repository<Category>, ICategoryRepositoryEF
    {
        public CategoryRepositoryEF(MySqlDbContext context) : base(context)
        {
        }

        public async Task<Category?> GetByNameAsync(string name)
        {
            // Kiểm tra trùng tên không phân biệt hoa/thường khi tạo category mới.
            return await _dbSet.FirstOrDefaultAsync(c => c.Name.ToLower() == name.ToLower());
        }

        public async Task<(List<Category> Categories, int TotalCount)> SearchAsync(string? keyword, int page, int pageSize)
        {
            // Bảo vệ phân trang trước các giá trị query string không hợp lệ.
            page = page < 1 ? 1 : page;
            pageSize = pageSize < 1 ? 10 : pageSize;

            // Chỉ hiển thị category chưa bị soft delete.
            var query = _dbSet.Where(c => !c.IsDeleted).AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                // Tìm theo tên hoặc mô tả danh mục.
                var normalizedKeyword = keyword.Trim().ToLower();
                query = query.Where(c =>
                    c.Name.ToLower().Contains(normalizedKeyword) ||
                    (c.Description != null && c.Description.ToLower().Contains(normalizedKeyword)));
            }

            // TotalCount tính sau filter để frontend render đúng số trang.
            var totalCount = await query.CountAsync();

            var categories = await query
                .OrderByDescending(c => c.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (categories, totalCount);
        }
    }
}

using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository.EFCore
{
    // Interface đặc thù cho Category
    public interface ICategoryRepositoryEF : IRepository<Category>
    {
        // Tìm danh mục theo tên (dùng để kiểm tra trùng tên khi tạo mới)
        Task<Category?> GetByNameAsync(string name);
    }

    // Repository cụ thể cho Category
    public class CategoryRepositoryEF : Repository<Category>, ICategoryRepositoryEF
    {
        public CategoryRepositoryEF(MySqlDbContext context) : base(context)
        {
        }

        // Tìm danh mục theo tên, so sánh không phân biệt hoa thường
        // Ví dụ: "electronics" và "Electronics" được coi là giống nhau
        public async Task<Category?> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(c => c.Name.ToLower() == name.ToLower());
        }
    }
}

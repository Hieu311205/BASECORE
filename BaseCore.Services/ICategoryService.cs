using BaseCore.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaseCore.Services
{
    // Interface định nghĩa các chức năng của CategoryService.
    // Quản lý danh mục sản phẩm: thêm, xem, sửa, xóa.
    public interface ICategoryService
    {
        // Lấy toàn bộ danh sách danh mục
        Task<List<Category>> GetAllAsync();

        // Lấy thông tin một danh mục theo id, trả về null nếu không tìm thấy
        Task<Category> GetByIdAsync(int id);

        // Tạo danh mục mới
        Task<Category> CreateAsync(Category category);

        // Cập nhật thông tin danh mục
        Task UpdateAsync(Category category);

        // Xóa danh mục theo id
        Task DeleteAsync(int id);
    }
}

using BaseCore.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaseCore.Services
{
    // Interface định nghĩa các chức năng của ProductService.
    // Controller không gọi trực tiếp vào database mà gọi qua interface này,
    // giúp dễ thay đổi implementation mà không ảnh hưởng code bên trên.
    public interface IProductService
    {
        // Lấy toàn bộ danh sách sản phẩm (kèm thông tin danh mục)
        Task<List<Product>> GetAllProductsAsync();

        // Lấy thông tin một sản phẩm theo id, trả về null nếu không tìm thấy
        Task<Product> GetProductByIdAsync(int id);

        // Tạo sản phẩm mới và lưu vào database
        Task<Product> CreateProductAsync(Product product);

        // Cập nhật thông tin sản phẩm
        Task UpdateProductAsync(Product product);

        // Xóa sản phẩm theo id
        Task DeleteProductAsync(int id);

        // Tìm kiếm sản phẩm theo từ khóa và/hoặc danh mục, có phân trang
        // Trả về tuple: (danh sách sản phẩm trong trang, tổng số kết quả)
        Task<(List<Product> Products, int TotalCount)> SearchAsync(string keyword, int? categoryId, int page, int pageSize);
    }
}

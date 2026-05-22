using System.Linq.Expressions;

namespace BaseCore.Repository.EFCore
{
    // Interface chung (Generic Repository Interface) cho tất cả repository.
    // T là kiểu entity, ví dụ: IRepository<Product>, IRepository<User>
    // where T : class → T phải là một class (không phải struct hay primitive type)
    //
    // Lợi ích của Repository Pattern:
    // 1. Tách biệt logic truy cập database khỏi business logic
    // 2. Dễ test (có thể mock repository thay vì dùng database thật)
    // 3. Thay đổi database (SQL → MongoDB) chỉ cần sửa implementation, không sửa code gọi
    public interface IRepository<T> where T : class
    {
        // ===== QUERY METHODS (đọc dữ liệu) =====

        // Tìm một bản ghi theo khóa chính (id)
        // Trả về null nếu không tìm thấy (T?)
        Task<T?> GetByIdAsync(object id);

        // Lấy toàn bộ danh sách bản ghi trong bảng
        Task<IEnumerable<T>> GetAllAsync();

        // Tìm kiếm theo điều kiện tùy ý (Lambda expression)
        // Ví dụ: FindAsync(p => p.CategoryId == 1)
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);

        // Lấy bản ghi đầu tiên thỏa điều kiện, hoặc null nếu không tìm thấy
        Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate);

        // ===== COMMAND METHODS (ghi dữ liệu) =====

        // Thêm mới một bản ghi và lưu vào database
        Task<T> AddAsync(T entity);

        // Thêm nhiều bản ghi cùng lúc (batch insert - hiệu quả hơn insert từng cái)
        Task AddRangeAsync(IEnumerable<T> entities);

        // Cập nhật thông tin bản ghi
        Task UpdateAsync(T entity);

        // Xóa bản ghi (xóa thật, không phải soft delete)
        Task DeleteAsync(T entity);

        // Xóa bản ghi theo id
        Task DeleteByIdAsync(object id);

        // ===== PAGINATION (phân trang) =====

        // Lấy dữ liệu có phân trang, lọc, và sắp xếp
        // Trả về tuple: (danh sách items trong trang, tổng số bản ghi)
        // page: trang thứ mấy (bắt đầu từ 1)
        // pageSize: số bản ghi mỗi trang
        // filter: điều kiện lọc (null = lấy tất cả)
        // orderBy: cột dùng để sắp xếp (null = không sắp xếp)
        // descending: true = giảm dần, false = tăng dần
        Task<(IEnumerable<T> Items, int TotalCount)> GetPagedAsync(
            int page,
            int pageSize,
            Expression<Func<T, bool>>? filter = null,
            Expression<Func<T, object>>? orderBy = null,
            bool descending = false);
    }
}

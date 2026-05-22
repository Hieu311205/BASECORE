using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace BaseCore.Repository.EFCore
{
    // Lớp Repository chung - implement tất cả phương thức từ IRepository<T>.
    // Đây là lớp cha, các repository cụ thể (ProductRepositoryEF, UserRepositoryEF...)
    // kế thừa từ lớp này và chỉ cần thêm những method đặc thù.
    //
    // Từ khóa "where T : class" → T phải là reference type (class), không phải value type
    public class Repository<T> : IRepository<T> where T : class
    {
        // _context: kết nối đến database qua Entity Framework Core
        protected readonly MySqlDbContext _context;

        // _dbSet: "cổng vào" của bảng tương ứng với kiểu T
        // Ví dụ: nếu T = Product thì _dbSet = _context.Products
        protected readonly DbSet<T> _dbSet;

        // Constructor: nhận DbContext từ Dependency Injection
        public Repository(MySqlDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>(); // Lấy DbSet tương ứng với kiểu T
        }

        // Tìm bản ghi theo khóa chính, trả về null nếu không có
        public virtual async Task<T?> GetByIdAsync(object id)
        {
            return await _dbSet.FindAsync(id);
        }

        // Lấy toàn bộ danh sách (cẩn thận với bảng có nhiều dữ liệu!)
        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        // Tìm kiếm theo điều kiện lambda
        // Ví dụ: await repo.FindAsync(p => p.CategoryId == 1 && p.Stock > 0)
        public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.Where(predicate).ToListAsync();
        }

        // Lấy bản ghi đầu tiên thỏa điều kiện
        public virtual async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.FirstOrDefaultAsync(predicate);
        }

        // Thêm mới một bản ghi: Add vào DbSet rồi SaveChanges để ghi xuống database
        public virtual async Task<T> AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync(); // Ghi thực sự xuống database
            return entity;
        }

        // Thêm nhiều bản ghi cùng lúc (1 lần SaveChanges thay vì N lần)
        public virtual async Task AddRangeAsync(IEnumerable<T> entities)
        {
            await _dbSet.AddRangeAsync(entities);
            await _context.SaveChangesAsync();
        }

        // Cập nhật bản ghi: EF Core tự phát hiện thuộc tính nào thay đổi và sinh UPDATE SQL
        public virtual async Task UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
        }

        // Xóa bản ghi khỏi database (xóa thật, không phải soft delete)
        public virtual async Task DeleteAsync(T entity)
        {
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
        }

        // Xóa theo id: tìm bản ghi trước, sau đó xóa
        public virtual async Task DeleteByIdAsync(object id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                await DeleteAsync(entity);
            }
        }

        // Lấy dữ liệu có phân trang
        public virtual async Task<(IEnumerable<T> Items, int TotalCount)> GetPagedAsync(
            int page,
            int pageSize,
            Expression<Func<T, bool>>? filter = null,
            Expression<Func<T, object>>? orderBy = null,
            bool descending = false)
        {
            IQueryable<T> query = _dbSet;

            // Áp dụng điều kiện lọc (nếu có)
            if (filter != null)
            {
                query = query.Where(filter);
            }

            // Đếm tổng số bản ghi TRƯỚC khi phân trang (để tính totalPages ở frontend)
            var totalCount = await query.CountAsync();

            // Áp dụng sắp xếp (nếu có)
            if (orderBy != null)
            {
                query = descending
                    ? query.OrderByDescending(orderBy)  // Giảm dần
                    : query.OrderBy(orderBy);           // Tăng dần
            }

            // Phân trang: Skip bỏ qua các trang trước, Take lấy đúng số lượng
            // Ví dụ: page=2, pageSize=10 → Skip(10).Take(10) → lấy bản ghi 11-20
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }
}

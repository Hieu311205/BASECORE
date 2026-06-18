using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace BaseCore.Repository.EFCore
{
    /// <summary>
    /// Generic Repository Implementation for Entity Framework Core
    /// Teaching Repository Pattern (Bài 10)
    /// </summary>
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly MySqlDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public Repository(MySqlDbContext context)
        {
            // DbSet<T> giúp repository thao tác generic với mọi entity EF Core.
            _context = context;
            _dbSet = context.Set<T>();
        }

        public virtual async Task<T?> GetByIdAsync(object id)
        {
            return await _dbSet.FindAsync(id);
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.Where(predicate).ToListAsync();
        }

        public virtual async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.FirstOrDefaultAsync(predicate);
        }

        public virtual async Task<T> AddAsync(T entity)
        {
            // Lưu ngay để caller nhận được khóa chính do database sinh ra.
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public virtual async Task AddRangeAsync(IEnumerable<T> entities)
        {
            await _dbSet.AddRangeAsync(entities);
            await _context.SaveChangesAsync();
        }

        public virtual async Task UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
        }

        public virtual async Task DeleteAsync(T entity)
        {
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public virtual async Task DeleteByIdAsync(object id)
        {
            // Xóa theo id chỉ thực hiện khi entity tồn tại để tránh lỗi null.
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                await DeleteAsync(entity);
            }
        }

        public virtual async Task<(IEnumerable<T> Items, int TotalCount)> GetPagedAsync(
            int page,
            int pageSize,
            Expression<Func<T, bool>>? filter = null,
            Expression<Func<T, object>>? orderBy = null,
            bool descending = false)
        {
            IQueryable<T> query = _dbSet;

            // Filter chạy trước Count để TotalCount phản ánh đúng điều kiện tìm kiếm.
            if (filter != null)
            {
                query = query.Where(filter);
            }

            // Lấy tổng số bản ghi trước khi Skip/Take để frontend tính tổng số trang.
            var totalCount = await query.CountAsync();

            // Sắp xếp có điều kiện; nếu không truyền orderBy thì giữ thứ tự mặc định từ database.
            if (orderBy != null)
            {
                query = descending
                    ? query.OrderByDescending(orderBy)
                    : query.OrderBy(orderBy);
            }

            // Phân trang phía database, tránh load toàn bộ dữ liệu vào memory.
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }
}

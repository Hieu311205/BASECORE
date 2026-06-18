//using Microsoft.EntityFrameworkCore;
//using BaseCore.Entities;

//namespace BaseCore.Repository.EFCore
//{
//    /// <summary>
//    /// User Repository using Entity Framework Core
//    /// </summary>
//    public interface IUserRepositoryEF : IRepository<User>
//    {
//        Task<User?> GetByUsernameAsync(string username);
//        Task<(List<User> Users, int TotalCount)> SearchAsync(string? keyword, int page, int pageSize);
//    }

//    public class UserRepositoryEF : Repository<User>, IUserRepositoryEF
//    {
//        public UserRepositoryEF(MySqlDbContext context) : base(context)
//        {
//        }

//        public async Task<User?> GetByUsernameAsync(string username)
//        {
//            return await _dbSet.FirstOrDefaultAsync(u => u.UserName == username && u.IsActive);
//        }

//        public async Task<(List<User> Users, int TotalCount)> SearchAsync(string? keyword, int page, int pageSize)
//        {
//            var query = _dbSet.AsQueryable();

//            if (!string.IsNullOrEmpty(keyword))
//            {
//                keyword = keyword.ToLower();
//                query = query.Where(u =>
//                    u.UserName.ToLower().Contains(keyword) ||
//                    u.Name.ToLower().Contains(keyword) ||
//                    (u.Email != null && u.Email.ToLower().Contains(keyword)));
//            }

//            var totalCount = await query.CountAsync();

//            var users = await query
//                .OrderByDescending(u => u.Created)
//                .Skip((page - 1) * pageSize)
//                .Take(pageSize)
//                .ToListAsync();

//            return (users, totalCount);
//        }
//    }
//}
using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseCore.Repository.EFCore
{
    public interface IUserRepositoryEF : IRepository<User>
    {
        Task<User?> GetByUsernameAsync(string username);
        Task<User?> GetByIdAsync(int id);
        Task<List<User>> GetAllAsync();
        Task CreateAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(int id);
        Task<(List<User> Users, int TotalCount)> SearchAsync(string? keyword, int page, int pageSize, bool? isActive = true, int? excludeUserType = null);
    }

    public class UserRepositoryEF : Repository<User>, IUserRepositoryEF
    {
        private readonly MySqlDbContext _context;

        public UserRepositoryEF(MySqlDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            // Chỉ cho phép đăng nhập với tài khoản đang active.
            return await _dbSet.FirstOrDefaultAsync(u => u.UserName == username && u.IsActive);
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task<List<User>> GetAllAsync()
        {
            // Danh sách quản trị bỏ qua các tài khoản đã bị vô hiệu hóa/xóa.
            return await _dbSet.Where(u => u.IsActive).ToListAsync();
        }

        public async Task CreateAsync(User user)
        {
            _dbSet.Add(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(User user)
        {
            _dbSet.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var user = await _dbSet.FindAsync(id);
            if (user != null)
            {
                // Hiện tại là xóa vật lý; nếu cần giữ lịch sử nên đổi sang IsActive = false.
                user.IsActive = false;
                _dbSet.Update(user);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<(List<User> Users, int TotalCount)> SearchAsync(string? keyword, int page, int pageSize, bool? isActive = true, int? excludeUserType = null)
        {
            var query = _dbSet.AsQueryable();

            // Search user chỉ áp dụng trên tài khoản active.
            if (isActive.HasValue)
            {
                query = query.Where(u => u.IsActive == isActive.Value);
            }

            if (excludeUserType.HasValue)
            {
                query = query.Where(u => u.UserType != excludeUserType.Value);
            }

            if (!string.IsNullOrEmpty(keyword))
            {
                // Tìm theo thông tin định danh và liên hệ thường dùng trên màn hình quản trị user.
                keyword = keyword.ToLower();
                query = query.Where(u =>
                    u.UserName.ToLower().Contains(keyword) ||
                    u.Name.ToLower().Contains(keyword) ||
                    (u.Email != null && u.Email.ToLower().Contains(keyword)) ||
                    (u.Phone != null && u.Phone.ToLower().Contains(keyword))
                );
            }

            // Đếm tổng sau khi lọc keyword để frontend phân trang đúng.
            var totalCount = await query.CountAsync();

            var users = await query
                .OrderByDescending(u => u.Created)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (users, totalCount);
        }
    }
}

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
    // Interface đặc thù cho User, bổ sung thêm các method quản lý user
    public interface IUserRepositoryEF : IRepository<User>
    {
        // Tìm user theo username (dùng khi đăng nhập)
        Task<User?> GetByUsernameAsync(string username);

        // Lấy user theo id số nguyên (override lại vì IRepository dùng object)
        Task<User?> GetByIdAsync(int id);

        // Lấy danh sách tất cả user đang hoạt động
        Task<List<User>> GetAllAsync();

        // Tạo user mới
        Task CreateAsync(User user);

        // Cập nhật thông tin user
        Task UpdateAsync(User user);

        // Xóa user theo id
        Task DeleteAsync(int id);

        // Tìm kiếm user theo từ khóa, có phân trang
        Task<(List<User> Users, int TotalCount)> SearchAsync(string? keyword, int page, int pageSize);
    }

    // Repository cụ thể cho User
    public class UserRepositoryEF : Repository<User>, IUserRepositoryEF
    {
        private readonly MySqlDbContext _context;

        public UserRepositoryEF(MySqlDbContext context) : base(context)
        {
            _context = context;
        }

        // Tìm user theo username, chỉ lấy user đang hoạt động (IsActive = true)
        // Dùng khi đăng nhập để kiểm tra username có tồn tại và đang hoạt động không
        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.UserName == username && u.IsActive);
        }

        // Tìm user theo id số nguyên
        public async Task<User?> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        // Lấy tất cả user đang hoạt động (IsActive = true)
        public async Task<List<User>> GetAllAsync()
        {
            return await _dbSet.Where(u => u.IsActive).ToListAsync();
        }

        // Thêm user mới vào database
        public async Task CreateAsync(User user)
        {
            _dbSet.Add(user);
            await _context.SaveChangesAsync();
        }

        // Cập nhật thông tin user
        public async Task UpdateAsync(User user)
        {
            _dbSet.Update(user);
            await _context.SaveChangesAsync();
        }

        // Xóa user: tìm theo id rồi xóa khỏi database
        public async Task DeleteAsync(int id)
        {
            var user = await _dbSet.FindAsync(id);
            if (user != null)
            {
                _dbSet.Remove(user);
                await _context.SaveChangesAsync();
            }
        }

        // Tìm kiếm user theo từ khóa (username, tên, email, phone), có phân trang
        public async Task<(List<User> Users, int TotalCount)> SearchAsync(string? keyword, int page, int pageSize)
        {
            var query = _dbSet.AsQueryable();

            // Chỉ lấy user đang hoạt động
            query = query.Where(u => u.IsActive);

            // Lọc theo từ khóa nếu có (tìm không phân biệt hoa thường)
            if (!string.IsNullOrEmpty(keyword))
            {
                keyword = keyword.ToLower();
                query = query.Where(u =>
                    u.UserName.ToLower().Contains(keyword) ||
                    u.Name.ToLower().Contains(keyword) ||
                    (u.Email != null && u.Email.ToLower().Contains(keyword)) ||
                    (u.Phone != null && u.Phone.ToLower().Contains(keyword))
                );
            }

            // Đếm tổng số trước khi phân trang
            var totalCount = await query.CountAsync();

            // Sắp xếp user mới tạo lên đầu, rồi phân trang
            var users = await query
                .OrderByDescending(u => u.Created)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (users, totalCount);
        }
    }
}

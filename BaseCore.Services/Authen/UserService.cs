//using BaseCore.Common;
//using BaseCore.Entities;
//using BaseCore.Repository.Authen;
//... (phiên bản cũ dùng MongoDB - đã comment lại)
using BaseCore.Common;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseCore.Services.Authen
{
    // Interface cho UserService - định nghĩa các chức năng quản lý người dùng
    public interface IUserService
    {
        // Xác thực đăng nhập: kiểm tra username + password, trả về User nếu đúng, null nếu sai
        Task<User?> Authenticate(string username, string password);

        // Lấy tất cả user đang hoạt động
        Task<List<User>> GetAll();

        // Lấy thông tin user theo id
        Task<User?> GetById(int id);

        // Tạo user mới với mật khẩu (sẽ được hash trước khi lưu)
        Task<User> Create(User user, string password);

        // Cập nhật thông tin user, password có thể null (không thay đổi mật khẩu)
        Task Update(User user, string? password = null);

        // Xóa user theo id
        Task Delete(int id);

        // Tìm kiếm user theo từ khóa, có phân trang
        Task<(List<User> Users, int TotalCount)> Search(string keyword, int page, int pageSize);
    }

    // Lớp xử lý nghiệp vụ quản lý người dùng và xác thực
    public class UserService : IUserService
    {
        private readonly IUserRepositoryEF _userRepository;

        public UserService(IUserRepositoryEF userRepository)
        {
            _userRepository = userRepository;
        }

        // Xác thực đăng nhập
        // Quy trình: kiểm tra username tồn tại → kiểm tra mật khẩu → trả về user
        public async Task<User?> Authenticate(string username, string password)
        {
            // Từ chối nếu thiếu thông tin đăng nhập
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
                return null;

            // Tìm user theo username (chỉ lấy user đang hoạt động)
            var user = await _userRepository.GetByUsernameAsync(username);

            if (user == null)
                return null; // Username không tồn tại

            bool isValidPassword;

            // Kiểm tra mật khẩu:
            // Nếu user có Salt → mật khẩu đã được hash → dùng TokenHelper để xác thực
            // Nếu không có Salt → mật khẩu lưu dạng thô → so sánh trực tiếp (dữ liệu cũ)
            if (user.Salt != null && user.Salt.Length > 0)
            {
                isValidPassword = TokenHelper.IsValidPassword(password, user.Salt, user.Password);
            }
            else
            {
                isValidPassword = (user.Password == password);
            }

            if (!isValidPassword)
                return null; // Sai mật khẩu

            return user; // Đăng nhập thành công
        }

        // Lấy tất cả user đang hoạt động
        public async Task<List<User>> GetAll()
        {
            var users = await _userRepository.GetAllAsync();
            return users.ToList(); // Chuyển từ IEnumerable sang List
        }

        // Lấy user theo id
        public async Task<User?> GetById(int id)
        {
            return await _userRepository.GetByIdAsync(id);
        }

        // Tạo user mới:
        // 1. Hash mật khẩu + tạo salt ngẫu nhiên bằng PBKDF2
        // 2. Gán thời gian tạo và trạng thái active
        // 3. Lưu vào database
        public async Task<User> Create(User user, string password)
        {
            byte[] salt; // Salt sẽ được tạo ngẫu nhiên trong HashPassword
            user.Password = TokenHelper.HashPassword(password, out salt); // Mã hóa mật khẩu
            user.Salt = salt;         // Lưu salt để sau này dùng xác thực
            user.Created = DateTime.Now;
            user.IsActive = true;

            await _userRepository.CreateAsync(user);
            return user;
        }

        // Cập nhật thông tin user
        // Nếu truyền password mới → hash lại và cập nhật
        // Nếu không truyền password → chỉ cập nhật thông tin khác
        public async Task Update(User user, string? password = null)
        {
            if (!string.IsNullOrEmpty(password))
            {
                byte[] salt;
                user.Password = TokenHelper.HashPassword(password, out salt);
                user.Salt = salt;
            }

            await _userRepository.UpdateAsync(user);
        }

        // Xóa user theo id
        public async Task Delete(int id)
        {
            await _userRepository.DeleteAsync(id);
        }

        // Tìm kiếm user theo từ khóa với phân trang
        public async Task<(List<User> Users, int TotalCount)> Search(string keyword, int page, int pageSize)
        {
            return await _userRepository.SearchAsync(keyword, page, pageSize);
        }
    }
}

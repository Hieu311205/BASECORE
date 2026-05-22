using Microsoft.AspNetCore.Http;
using MongoDB.Bson;
using MongoDB.Driver;
using BaseCore.Libs.Repository;
using BaseCore.LogService.Entities;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace BaseCore.LogService
{
    // Interface cho service ghi log lỗi
    public interface ILogErrorService : IMongoRepository<LogError>
    {
        // Lấy toàn bộ danh sách log lỗi
        Task<ICollection<LogError>> GetAllListAsync();

        // Ghi log lỗi từ HttpContext và message lỗi
        Task CreateLog(HttpContext httpContext, string message);
    }

    // Service ghi log lỗi vào MongoDB
    // Được gọi bởi ExceptionMiddleware khi có exception xảy ra
    public class LogErrorService : MongoRepository<LogError>, ILogErrorService
    {
        private readonly IDbContext _context;

        public LogErrorService(IDbContext dbContext) : base(dbContext)
        {
            _context = dbContext;
        }

        // Tạo một bản ghi log lỗi từ context của HTTP request
        // httpContext: thông tin request đang xử lý khi lỗi xảy ra
        // message: thông báo lỗi (exception message)
        public async Task CreateLog(HttpContext httpContext, string message)
        {
            var requestBody = string.Empty;

            // EnableBuffering: cho phép đọc lại Body nhiều lần (Body stream chỉ đọc được 1 lần)
            httpContext.Request.EnableBuffering();

            // Đọc nội dung body của request để lưu vào log
            using (var reader = new StreamReader(httpContext.Request.Body))
            {
                requestBody = reader.ReadToEnd();
                httpContext.Request.Body.Seek(0, SeekOrigin.Begin); // Reset vị trí đọc về đầu
                requestBody = reader.ReadToEnd();
            }

            // Tạo URL đầy đủ từ các phần: scheme (http/https) + host + path
            var pathUrl = string.Format("{0}://{1}{2}",
                httpContext.Request.Scheme,
                httpContext.Request.Host,
                httpContext.Request.Path);

            // Tạo bản ghi log lỗi chứa đầy đủ thông tin để debug
            var logError = new LogError
            {
                Header = $"REQUEST HttpMethod: {httpContext.Request.Method}, Path: {pathUrl}, Content-Type: {httpContext.Request.ContentType}",
                Body = requestBody,           // Body của request (dữ liệu gửi lên)
                CreatedUser = httpContext.User.Identity.Name, // User đang đăng nhập (nếu có)
                Message = message             // Thông báo lỗi
            };

            await CreateAsync(logError); // Lưu vào MongoDB
        }

        // Lấy toàn bộ log lỗi từ MongoDB
        public async Task<ICollection<LogError>> GetAllListAsync()
        {
            FilterDefinition<LogError> filter = Builders<LogError>.Filter.Where(m => m.Id != BsonObjectId.Empty);
            return await GetAllAsync(filter);
        }
    }
}

using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

using MongoDB.Bson;
using MongoDB.Driver;
using BaseCore.Libs.Repository;
using BaseCore.LogService.Entities;

namespace BaseCore.LogService
{
    // Interface cho service ghi log hành động người dùng
    public interface ILogActionService : IMongoRepository<LogAction>
    {
        // Lấy toàn bộ danh sách log hành động
        Task<ICollection<LogAction>> GetAllListAsync();

        // Ghi một bản ghi log hành động mới vào MongoDB
        Task CreateLog(LogAction logAction);
    }

    // Service ghi log hành động, lưu vào MongoDB
    // Kế thừa MongoRepository<LogAction> nên có sẵn các phương thức CRUD cho MongoDB
    public class LogActionService : MongoRepository<LogAction>, ILogActionService
    {
        private readonly IDbContext _context;

        public LogActionService(IDbContext dbContext) : base(dbContext)
        {
            _context = dbContext;
        }

        // Lấy toàn bộ log (lọc để loại bỏ document có Id = rỗng)
        public async Task<ICollection<LogAction>> GetAllListAsync()
        {
            // Filter: lấy tất cả document có Id khác BsonObjectId.Empty
            FilterDefinition<LogAction> filter = Builders<LogAction>.Filter.Where(m => m.Id != BsonObjectId.Empty);
            return await GetAllAsync(filter);
        }

        // Ghi một log hành động mới vào MongoDB
        public async Task CreateLog(LogAction logAction)
        {
            await CreateAsync(logAction);
        }
    }
}

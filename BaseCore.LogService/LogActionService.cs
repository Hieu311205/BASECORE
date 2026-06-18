using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

using MongoDB.Bson;
using MongoDB.Driver;
using BaseCore.LogService.Entities;
using BaseCore.LogService.Repository;

namespace BaseCore.LogService
{
    public interface ILogActionService : IMongoRepository<LogAction>
    {
        Task<ICollection<LogAction>> GetAllListAsync();

        Task CreateLog(LogAction logAction);
    }

    public class LogActionService : MongoRepository<LogAction>, ILogActionService
    {
        private readonly IDbContext _context;
        public LogActionService(IDbContext dbContext) : base(dbContext)
        {
            _context = dbContext;
        }

        public async Task<ICollection<LogAction>> GetAllListAsync()
        {
            FilterDefinition<LogAction> filter = Builders<LogAction>.Filter.Where(m => !string.IsNullOrWhiteSpace(m.Id));
            return await GetAllAsync(filter);
        }

        public async Task CreateLog(LogAction logAction)
        {
            await CreateAsync(logAction);
        }
    }
}

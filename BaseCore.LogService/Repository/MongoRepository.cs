using System.Collections.Generic;
using System.Threading.Tasks;
using BaseCore.Common;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace BaseCore.LogService.Repository
{
    public interface IDbContext
    {
        IMongoCollection<T> GetCollection<T>() where T : Entity;
    }

    public class DbContext : IDbContext
    {
        private readonly IMongoDatabase _database;

        public DbContext(IConfiguration configuration)
        {
            var connectionString = configuration["MongoDB:ConnectionString"];
            var databaseName = configuration["MongoDB:Database"];
            var client = new MongoClient(connectionString);
            _database = client.GetDatabase(databaseName);
        }

        public IMongoCollection<T> GetCollection<T>() where T : Entity
        {
            return _database.GetCollection<T>(typeof(T).Name);
        }
    }

    public interface IMongoRepository<T> where T : Entity
    {
        Task<ICollection<T>> GetAllAsync(FilterDefinition<T> filter);
        Task CreateAsync(T entity);
    }

    public class MongoRepository<T> : IMongoRepository<T> where T : Entity
    {
        private readonly IMongoCollection<T> _collection;

        public MongoRepository(IDbContext dbContext)
        {
            _collection = dbContext.GetCollection<T>();
        }

        public async Task<ICollection<T>> GetAllAsync(FilterDefinition<T> filter)
        {
            return await _collection.Find(filter).ToListAsync();
        }

        public async Task CreateAsync(T entity)
        {
            await _collection.InsertOneAsync(entity);
        }
    }
}

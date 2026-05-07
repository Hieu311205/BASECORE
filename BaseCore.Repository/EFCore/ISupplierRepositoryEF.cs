//using BaseCore.Entities;

//namespace BaseCore.Repository.EFCore
//{
//    public interface ISupplierRepositoryEF
//    {
//        Task<(IEnumerable<Supplier> suppliers, int totalCount)> SearchAsync(string? keyword, int page, int pageSize);
//        Task<Supplier?> GetByIdAsync(int id);
//        Task AddAsync(Supplier supplier);
//        Task UpdateAsync(Supplier supplier);
//        Task DeleteAsync(Supplier supplier);
//    }
//}
using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository.EFCore
{
    public interface ISupplierRepositoryEF : IRepository<Supplier>
    {
        Task<(List<Supplier> Suppliers, int TotalCount)> SearchAsync(
            string? keyword,
            bool? isActive,
            int page,
            int pageSize
        );
    }

    public class SupplierRepositoryEF : Repository<Supplier>, ISupplierRepositoryEF
    {
        public SupplierRepositoryEF(MySqlDbContext context) : base(context)
        {
        }

        public async Task<(List<Supplier> Suppliers, int TotalCount)> SearchAsync(
            string? keyword,
            bool? isActive,
            int page,
            int pageSize
        )
        {
            var query = _dbSet.AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
            {
                keyword = keyword.ToLower();

                query = query.Where(s =>
                    s.Name.ToLower().Contains(keyword) ||
                    (s.Phone != null && s.Phone.ToLower().Contains(keyword)) ||
                    (s.Email != null && s.Email.ToLower().Contains(keyword)) ||
                    (s.Address != null && s.Address.ToLower().Contains(keyword))
                );
            }

            if (isActive.HasValue)
            {
                query = query.Where(s => s.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();

            var suppliers = await query
                .OrderByDescending(s => s.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (suppliers, totalCount);
        }
    }
}

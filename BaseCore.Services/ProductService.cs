//using MongoDB.Driver;
//using BaseCore.Entities;
//using BaseCore.Repository;
//using System.Collections.Generic;
//using System.Threading.Tasks;

//namespace BaseCore.Services
//{
//    public class ProductService : IProductService
//    {
//        private readonly MongoDbContext _context;

//        public ProductService(MongoDbContext context)
//        {
//            _context = context;
//        }

//        public async Task<List<Product>> GetAllProductsAsync()
//        {
//            var products = await _context.Products.Find(_ => true).ToListAsync();

//            // Load categories for each product
//            foreach (var product in products)
//            {
//                product.Category = await _context.Categories
//                    .Find(c => c.Id == product.CategoryId)
//                    .FirstOrDefaultAsync();
//            }

//            return products;
//        }

//        public async Task<Product> GetProductByIdAsync(int id)
//        {
//            var product = await _context.Products
//                .Find(p => p.Id == id)
//                .FirstOrDefaultAsync();

//            if (product != null)
//            {
//                product.Category = await _context.Categories
//                    .Find(c => c.Id == product.CategoryId)
//                    .FirstOrDefaultAsync();
//            }

//            return product;
//        }

//        public async Task<Product> CreateProductAsync(Product product)
//        {
//            // Get next ID
//            var maxProduct = await _context.Products
//                .Find(_ => true)
//                .SortByDescending(p => p.Id)
//                .FirstOrDefaultAsync();
//            product.Id = (maxProduct?.Id ?? 0) + 1;

//            await _context.Products.InsertOneAsync(product);
//            return product;
//        }

//        public async Task UpdateProductAsync(Product product)
//        {
//            await _context.Products.ReplaceOneAsync(p => p.Id == product.Id, product);
//        }

//        public async Task DeleteProductAsync(int id)
//        {
//            await _context.Products.DeleteOneAsync(p => p.Id == id);
//        }

//        public async Task<(List<Product> Products, int TotalCount)> SearchAsync(string keyword, int? categoryId, int page, int pageSize)
//        {
//            var filterBuilder = Builders<Product>.Filter;
//            var filter = filterBuilder.Empty;

//            if (!string.IsNullOrEmpty(keyword))
//            {
//                var keywordFilter = filterBuilder.Or(
//                    filterBuilder.Regex(p => p.Name, new MongoDB.Bson.BsonRegularExpression(keyword, "i")),
//                    filterBuilder.Regex(p => p.Description, new MongoDB.Bson.BsonRegularExpression(keyword, "i"))
//                );
//                filter = filterBuilder.And(filter, keywordFilter);
//            }

//            if (categoryId.HasValue)
//            {
//                filter = filterBuilder.And(filter, filterBuilder.Eq(p => p.CategoryId, categoryId.Value));
//            }

//            var totalCount = (int)await _context.Products.CountDocumentsAsync(filter);

//            var products = await _context.Products
//                .Find(filter)
//                .SortByDescending(p => p.Id)
//                .Skip((page - 1) * pageSize)
//                .Limit(pageSize)
//                .ToListAsync();

//            // Load categories
//            foreach (var product in products)
//            {
//                product.Category = await _context.Categories
//                    .Find(c => c.Id == product.CategoryId)
//                    .FirstOrDefaultAsync();
//            }

//            return (products, totalCount);
//        }
//    }
//}
using BaseCore.Entities;
using BaseCore.Repository;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseCore.Services
{
    // Lớp xử lý nghiệp vụ liên quan đến sản phẩm.
    // ProductService là tầng Service Layer: nhận yêu cầu từ Controller,
    // xử lý logic nghiệp vụ, rồi gọi xuống database thông qua DbContext.
    public class ProductService : IProductService
    {
        // Inject DbContext để truy cập database trực tiếp
        private readonly MySqlDbContext _context;

        public ProductService(MySqlDbContext context)
        {
            _context = context;
        }

        // Lấy toàn bộ sản phẩm, kèm thông tin danh mục (Include = JOIN trong SQL)
        public async Task<List<Product>> GetAllProductsAsync()
        {
            return await _context.Products
                .Include(p => p.Category) // LEFT JOIN Categories ON Products.CategoryId = Categories.Id
                .ToListAsync();
        }

        // Lấy thông tin một sản phẩm theo id, kèm danh mục
        public async Task<Product?> GetProductByIdAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        // Thêm sản phẩm mới vào database
        // EF Core tự sinh câu INSERT INTO Products (...)
        public async Task<Product> CreateProductAsync(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync(); // Ghi vào database
            return product; // Trả về product đã có Id (được database gán tự động)
        }

        // Cập nhật sản phẩm
        // EF Core tự sinh câu UPDATE Products SET ... WHERE Id = ...
        public async Task UpdateProductAsync(Product product)
        {
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
        }

        // Xóa sản phẩm theo id
        public async Task DeleteProductAsync(int id)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (product != null)
            {
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
            }
        }

        // Tìm kiếm sản phẩm với lọc + phân trang
        public async Task<(List<Product> Products, int TotalCount)> SearchAsync(string keyword, int? categoryId, int page, int pageSize)
        {
            // Bắt đầu với toàn bộ Products kèm Category
            var query = _context.Products
                .Include(p => p.Category)
                .AsQueryable(); // AsQueryable cho phép thêm điều kiện lọc tiếp theo

            // Lọc theo từ khóa (tìm trong tên hoặc mô tả)
            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(p =>
                    p.Name.Contains(keyword) ||
                    p.Description.Contains(keyword));
            }

            // Lọc theo danh mục nếu có chỉ định
            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            // Đếm tổng kết quả (để tính số trang)
            var totalCount = await query.CountAsync();

            // Lấy dữ liệu trang hiện tại
            var products = await query
                .OrderByDescending(p => p.Id) // Sản phẩm mới nhất lên đầu
                .Skip((page - 1) * pageSize)  // Bỏ qua các trang trước
                .Take(pageSize)               // Lấy đúng số lượng mỗi trang
                .ToListAsync();

            return (products, totalCount);
        }
    }
}

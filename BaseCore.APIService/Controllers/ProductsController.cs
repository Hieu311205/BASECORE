using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.APIService.Controllers
{
    /// <summary>
    /// Product API Controller
    /// Teaching: RESTful API, CRUD Operations, EF Core (Bài 10, 11)
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductRepositoryEF _productRepository;
        private readonly ICategoryRepositoryEF _categoryRepository;
        private readonly ISupplierRepositoryEF _supplierRepository;

        public ProductsController(
            IProductRepositoryEF productRepository,
            ICategoryRepositoryEF categoryRepository,
            ISupplierRepositoryEF supplierRepository)
        {
            _productRepository = productRepository;
            _categoryRepository = categoryRepository;
            _supplierRepository = supplierRepository;
        }

        /// <summary>
        /// Get all products with pagination and search
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? keyword,
            [FromQuery] int? categoryId,
            [FromQuery] bool? isActive,
            [FromQuery] int? supplierId,
            [FromQuery] int? minStock,
            [FromQuery] int? maxStock,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            // SearchAsync gom cả lọc, phân trang và totalCount để frontend render bảng dữ liệu.
            var (products, totalCount) = await _productRepository.SearchAsync(keyword, categoryId, isActive, page, pageSize, supplierId, minStock, maxStock, minPrice, maxPrice);

            return Ok(new
            {
                items = products,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }

        /// <summary>
        /// Get product by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found" });

            return Ok(product);
        }

        /// <summary>
        /// Create new product (requires authentication)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] ProductCreateDto dto)
        {
            // Kiểm tra khóa ngoại trước khi insert để trả lỗi rõ ràng thay vì lỗi database.
            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);
            if (category == null)
                return BadRequest(new { message = "Category not found" });

            if (dto.SupplierId.HasValue)
            {
                var supplier = await _supplierRepository.GetByIdAsync(dto.SupplierId.Value);
                if (supplier == null)
                    return BadRequest(new { message = "Supplier not found" });
            }

            var product = new Product
            {
                // DTO chỉ chứa dữ liệu client được phép gửi; entity được tạo ở server để kiểm soát default value.
                Name = dto.Name,
                Price = dto.Price,
                Stock = dto.Stock,
                CategoryId = dto.CategoryId,
                SupplierId = dto.SupplierId,
                Sku = dto.Sku,
                Slug = dto.Slug,
                Description = dto.Description,
                ImageUrl = dto.ImageUrl ?? "",
                IsActive = dto.IsActive ?? true,
                CreatedAt = DateTime.Now
            };

            await _productRepository.AddAsync(product);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

        /// <summary>
        /// Update product (requires authentication)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductUpdateDto dto)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found" });

            // Cập nhật dạng partial: field null nghĩa là giữ nguyên giá trị hiện tại.
            product.Name = dto.Name ?? product.Name;
            product.Price = dto.Price ?? product.Price;
            product.Stock = dto.Stock ?? product.Stock;
            product.CategoryId = dto.CategoryId ?? product.CategoryId;
            product.SupplierId = dto.SupplierId ?? product.SupplierId;
            product.Sku = dto.Sku ?? product.Sku;
            product.Slug = dto.Slug ?? product.Slug;
            product.Description = dto.Description ?? product.Description;
            product.ImageUrl = dto.ImageUrl ?? product.ImageUrl;
            product.IsActive = dto.IsActive ?? product.IsActive;
            product.UpdatedAt = DateTime.Now;

            await _productRepository.UpdateAsync(product);
            return Ok(product);
        }

        /// <summary>
        /// Delete product (requires authentication)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found" });

            // Soft delete để sản phẩm không còn hiển thị nhưng vẫn giữ lịch sử đơn hàng/tham chiếu.
            product.IsDeleted = true;
            product.IsActive = false;
            product.UpdatedAt = DateTime.Now;
            await _productRepository.UpdateAsync(product);
            return Ok(new { message = "Product deleted successfully" });
        }

        /// <summary>
        /// Get products by category
        /// </summary>
        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetByCategory(int categoryId)
        {
            var products = await _productRepository.GetByCategoryAsync(categoryId);
            return Ok(products);
        }
    }

    // DTOs
    public class ProductCreateDto
    {
        public string Name { get; set; } = "";
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public int CategoryId { get; set; }
        public int? SupplierId { get; set; }
        public string? Sku { get; set; }
        public string? Slug { get; set; }
        public bool? IsActive { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class ProductUpdateDto
    {
        public string? Name { get; set; }
        public decimal? Price { get; set; }
        public int? Stock { get; set; }
        public int? CategoryId { get; set; }
        public int? SupplierId { get; set; }
        public string? Sku { get; set; }
        public string? Slug { get; set; }
        public bool? IsActive { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
    }
}

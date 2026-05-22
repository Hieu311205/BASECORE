using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.APIService.Controllers
{
    // Controller xử lý các API liên quan đến sản phẩm.
    // Route "api/[controller]" → URL sẽ là: /api/products
    // [ApiController]: tự động validate model, tự trả lỗi 400 nếu dữ liệu không hợp lệ
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        // Inject repository qua constructor (Dependency Injection)
        private readonly IProductRepositoryEF _productRepository;
        private readonly ICategoryRepositoryEF _categoryRepository;

        public ProductsController(IProductRepositoryEF productRepository, ICategoryRepositoryEF categoryRepository)
        {
            _productRepository = productRepository;
            _categoryRepository = categoryRepository;
        }

        // GET /api/products?keyword=laptop&categoryId=1&page=1&pageSize=10
        // Lấy danh sách sản phẩm có tìm kiếm và phân trang
        // [FromQuery]: lấy tham số từ URL query string
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? keyword,
            [FromQuery] int? categoryId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var (products, totalCount) = await _productRepository.SearchAsync(keyword, categoryId, page, pageSize);

            // Trả về kết quả kèm thông tin phân trang để frontend biết tổng số trang
            return Ok(new
            {
                items = products,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize) // Tính số trang
            });
        }

        // GET /api/products/5
        // Lấy thông tin một sản phẩm theo id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found" }); // Trả về 404

            return Ok(product); // Trả về 200 kèm dữ liệu
        }

        // POST /api/products
        // Tạo sản phẩm mới (yêu cầu đăng nhập - [Authorize])
        // [FromBody]: lấy dữ liệu từ body của request (JSON)
        [HttpPost]
        [Authorize] // Chỉ user đã đăng nhập mới được tạo sản phẩm
        public async Task<IActionResult> Create([FromBody] ProductCreateDto dto)
        {
            // Kiểm tra danh mục có tồn tại không
            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);
            if (category == null)
                return BadRequest(new { message = "Category not found" }); // 400: dữ liệu không hợp lệ

            // Tạo entity Product từ DTO (Data Transfer Object)
            var product = new Product
            {
                Name = dto.Name,
                Price = dto.Price,
                Stock = dto.Stock,
                CategoryId = dto.CategoryId,
                Description = dto.Description,
                ImageUrl = dto.ImageUrl ?? ""
            };

            await _productRepository.AddAsync(product);

            // Trả về 201 Created kèm URL để lấy sản phẩm vừa tạo
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

        // PUT /api/products/5
        // Cập nhật thông tin sản phẩm (yêu cầu đăng nhập)
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] ProductUpdateDto dto)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found" });

            // Chỉ cập nhật các trường được gửi lên (null = không thay đổi)
            product.Name = dto.Name ?? product.Name;
            product.Price = dto.Price ?? product.Price;
            product.Stock = dto.Stock ?? product.Stock;
            product.CategoryId = dto.CategoryId ?? product.CategoryId;
            product.Description = dto.Description ?? product.Description;
            product.ImageUrl = dto.ImageUrl ?? product.ImageUrl;

            await _productRepository.UpdateAsync(product);
            return Ok(product);
        }

        // DELETE /api/products/5
        // Xóa sản phẩm (yêu cầu đăng nhập)
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found" });

            await _productRepository.DeleteAsync(product);
            return Ok(new { message = "Product deleted successfully" });
        }

        // GET /api/products/category/1
        // Lấy tất cả sản phẩm thuộc một danh mục cụ thể
        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetByCategory(int categoryId)
        {
            var products = await _productRepository.GetByCategoryAsync(categoryId);
            return Ok(products);
        }
    }

    // DTO (Data Transfer Object) dùng khi tạo sản phẩm mới
    // Tách biệt với entity Product để kiểm soát chặt dữ liệu nhận vào
    public class ProductCreateDto
    {
        public string Name { get; set; } = "";
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public int CategoryId { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
    }

    // DTO dùng khi cập nhật sản phẩm
    // Tất cả trường đều nullable: chỉ cập nhật trường nào được gửi lên
    public class ProductUpdateDto
    {
        public string? Name { get; set; }
        public decimal? Price { get; set; }
        public int? Stock { get; set; }
        public int? CategoryId { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
    }
}

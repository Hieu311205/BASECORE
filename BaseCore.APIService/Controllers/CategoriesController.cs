using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.APIService.Controllers
{
    // Controller xử lý các API liên quan đến danh mục sản phẩm.
    // URL: /api/categories
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryRepositoryEF _categoryRepository;

        public CategoriesController(ICategoryRepositoryEF categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        // GET /api/categories
        // Lấy danh sách tất cả danh mục (không cần đăng nhập)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return Ok(categories);
        }

        // GET /api/categories/1
        // Lấy thông tin một danh mục theo id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                return NotFound(new { message = "Category not found" });

            return Ok(category);
        }

        // POST /api/categories
        // Tạo danh mục mới (yêu cầu đăng nhập)
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CategoryDto dto)
        {
            // Kiểm tra tên danh mục chưa bị trùng
            var existing = await _categoryRepository.GetByNameAsync(dto.Name);
            if (existing != null)
                return BadRequest(new { message = "Category name already exists" });

            var category = new Category
            {
                Name = dto.Name,
                Description = dto.Description ?? ""
            };

            await _categoryRepository.AddAsync(category);
            return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
        }

        // PUT /api/categories/1
        // Cập nhật danh mục (yêu cầu đăng nhập)
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] CategoryDto dto)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                return NotFound(new { message = "Category not found" });

            // Cập nhật chỉ trường nào được gửi (không null)
            category.Name = dto.Name ?? category.Name;
            category.Description = dto.Description ?? category.Description;

            await _categoryRepository.UpdateAsync(category);
            return Ok(category);
        }

        // DELETE /api/categories/1
        // Xóa danh mục (yêu cầu đăng nhập)
        // Lưu ý: sẽ bị lỗi nếu danh mục còn sản phẩm (do OnDelete Restrict)
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                return NotFound(new { message = "Category not found" });

            await _categoryRepository.DeleteAsync(category);
            return Ok(new { message = "Category deleted successfully" });
        }
    }

    // DTO dùng cho cả tạo mới lẫn cập nhật danh mục
    public class CategoryDto
    {
        public string Name { get; set; } = "";
        public string? Description { get; set; } // Nullable: không bắt buộc phải có mô tả
    }
}

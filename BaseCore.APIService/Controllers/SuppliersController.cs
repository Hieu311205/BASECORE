using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SuppliersController : ControllerBase
    {
        private readonly ISupplierRepositoryEF _supplierRepository;

        public SuppliersController(ISupplierRepositoryEF supplierRepository)
        {
            _supplierRepository = supplierRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? keyword,
            [FromQuery] bool? isActive,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            // Repository xử lý tìm kiếm, lọc trạng thái và phân trang cho danh sách nhà cung cấp.
            var (suppliers, totalCount) = await _supplierRepository.SearchAsync(keyword, isActive, page, pageSize);

            return Ok(new
            {
                items = suppliers,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var supplier = await _supplierRepository.GetByIdAsync(id);

            if (supplier == null)
                return NotFound(new { message = "Supplier not found" });

            return Ok(supplier);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] SupplierCreateDto dto)
        {
            // Chỉ map các trường được client phép nhập, các metadata như CreatedAt do server gán.
            var supplier = new Supplier
            {
                Name = dto.Name,
                ContactName = dto.ContactName,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.Now
            };

            await _supplierRepository.AddAsync(supplier);

            return CreatedAtAction(nameof(GetById), new { id = supplier.Id }, supplier);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] SupplierUpdateDto dto)
        {
            var supplier = await _supplierRepository.GetByIdAsync(id);

            if (supplier == null)
                return NotFound(new { message = "Supplier not found" });

            // Update dạng partial để client có thể sửa từng trường riêng lẻ.
            supplier.Name = dto.Name ?? supplier.Name;
            supplier.ContactName = dto.ContactName ?? supplier.ContactName;
            supplier.Email = dto.Email ?? supplier.Email;
            supplier.Phone = dto.Phone ?? supplier.Phone;
            supplier.Address = dto.Address ?? supplier.Address;
            supplier.IsActive = dto.IsActive ?? supplier.IsActive;
            supplier.UpdatedAt = DateTime.Now;

            await _supplierRepository.UpdateAsync(supplier);

            return Ok(supplier);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var supplier = await _supplierRepository.GetByIdAsync(id);

            if (supplier == null)
                return NotFound(new { message = "Supplier not found" });

            // Soft delete và tắt active để supplier không còn xuất hiện trong danh sách sử dụng.
            supplier.IsDeleted = true;
            supplier.IsActive = false;
            supplier.UpdatedAt = DateTime.Now;
            await _supplierRepository.UpdateAsync(supplier);

            return Ok(new { message = "Supplier deleted successfully" });
        }
    }

    public class SupplierCreateDto
    {
        public string Name { get; set; } = "";
        public string? ContactName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class SupplierUpdateDto
    {
        public string? Name { get; set; }
        public string? ContactName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public bool? IsActive { get; set; }
    }
}

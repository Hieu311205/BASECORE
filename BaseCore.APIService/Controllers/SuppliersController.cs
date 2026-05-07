using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
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
        [Authorize]
        public async Task<IActionResult> Create([FromBody] SupplierCreateDto dto)
        {
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
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] SupplierUpdateDto dto)
        {
            var supplier = await _supplierRepository.GetByIdAsync(id);

            if (supplier == null)
                return NotFound(new { message = "Supplier not found" });

            supplier.Name = dto.Name ?? supplier.Name;
            supplier.ContactName = dto.ContactName ?? supplier.ContactName;
            supplier.Email = dto.Email ?? supplier.Email;
            supplier.Phone = dto.Phone ?? supplier.Phone;
            supplier.Address = dto.Address ?? supplier.Address;
            supplier.IsActive = dto.IsActive ?? supplier.IsActive;

            await _supplierRepository.UpdateAsync(supplier);

            return Ok(supplier);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var supplier = await _supplierRepository.GetByIdAsync(id);

            if (supplier == null)
                return NotFound(new { message = "Supplier not found" });

            await _supplierRepository.DeleteAsync(supplier);

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

// Mẫu BrandsController cho module Thương hiệu.
// Hiện tại toàn bộ đang comment để chưa chạy.
// Khi muốn bật module này:
// 1. Tạo Entity BaseCore.Entities/Brand.cs.
// 2. Thêm DbSet<Brand> trong MySqlDbContext.cs.
// 3. Bỏ comment BrandRepository.cs.
// 4. Bỏ comment đăng ký repository trong Program.cs.
// 5. Bỏ comment file controller này.
// 6. Thêm route /api/brands trong ApiGateway nếu cần.

// using BaseCore.Entities;
// using BaseCore.Repository.EFCore;
// using Microsoft.AspNetCore.Mvc;

// namespace BaseCore.APIService.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     public class BrandsController : ControllerBase
//     {
//         private readonly IBrandRepositoryEF _brandRepository;

//         public BrandsController(IBrandRepositoryEF brandRepository)
//         {
//             _brandRepository = brandRepository;
//         }

//         [HttpGet]
//         public async Task<IActionResult> GetAll()
//         {
//             var brands = await _brandRepository.GetAllAsync();
//             var result = brands
//                 .Where(brand => !brand.IsDeleted)
//                 .OrderByDescending(brand => brand.Id)
//                 .ToList();

//             return Ok(result);
//         }

//         [HttpGet("{id}")]
//         public async Task<IActionResult> GetById(int id)
//         {
//             var brand = await _brandRepository.GetByIdAsync(id);

//             if (brand == null || brand.IsDeleted)
//             {
//                 return NotFound(new { message = "Brand not found" });
//             }

//             return Ok(brand);
//         }

//         [HttpPost]
//         public async Task<IActionResult> Create([FromBody] BrandCreateDto dto)
//         {
//             var brand = new Brand
//             {
//                 Name = dto.Name,
//                 Description = dto.Description ?? "",
//                 IsActive = dto.IsActive,
//                 CreatedAt = DateTime.Now,
//                 IsDeleted = false
//             };

//             await _brandRepository.AddAsync(brand);
//             return Ok(brand);
//         }

//         [HttpPut("{id}")]
//         public async Task<IActionResult> Update(int id, [FromBody] BrandUpdateDto dto)
//         {
//             var brand = await _brandRepository.GetByIdAsync(id);

//             if (brand == null || brand.IsDeleted)
//             {
//                 return NotFound(new { message = "Brand not found" });
//             }

//             brand.Name = dto.Name;
//             brand.Description = dto.Description ?? "";
//             brand.IsActive = dto.IsActive;
//             brand.UpdatedAt = DateTime.Now;

//             await _brandRepository.UpdateAsync(brand);
//             return Ok(brand);
//         }

//         [HttpDelete("{id}")]
//         public async Task<IActionResult> Delete(int id)
//         {
//             var brand = await _brandRepository.GetByIdAsync(id);

//             if (brand == null || brand.IsDeleted)
//             {
//                 return NotFound(new { message = "Brand not found" });
//             }

//             brand.IsDeleted = true;
//             brand.UpdatedAt = DateTime.Now;

//             await _brandRepository.UpdateAsync(brand);
//             return Ok(new { message = "Brand deleted successfully" });
//         }
//     }

//     public class BrandCreateDto
//     {
//         public string Name { get; set; } = "";
//         public string? Description { get; set; }
//         public bool IsActive { get; set; } = true;
//     }

//     public class BrandUpdateDto
//     {
//         public string Name { get; set; } = "";
//         public string? Description { get; set; }
//         public bool IsActive { get; set; } = true;
//     }
// }

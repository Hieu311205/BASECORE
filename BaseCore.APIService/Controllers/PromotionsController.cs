using BaseCore.Entities;
using BaseCore.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class PromotionsController : ControllerBase
    {
        private readonly MySqlDbContext _dbContext;

        public PromotionsController(MySqlDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? keyword,
            [FromQuery] bool? isActive,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize < 1 ? 10 : pageSize;

            var query = _dbContext.Promotions.AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var normalizedKeyword = keyword.Trim().ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(normalizedKeyword));
            }

            if (isActive.HasValue)
            {
                query = query.Where(p => p.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                items,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var promotion = await _dbContext.Promotions.FindAsync(id);
            if (promotion == null)
                return NotFound(new { message = "Không tìm thấy mã giảm giá" });

            return Ok(promotion);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PromotionDto dto)
        {
            var normalizedName = dto.Name.Trim();
            if (string.IsNullOrWhiteSpace(normalizedName))
                return BadRequest(new { message = "Tên/mã giảm giá là bắt buộc" });

            var exists = await _dbContext.Promotions.AnyAsync(p => p.Name == normalizedName);
            if (exists)
                return BadRequest(new { message = "Tên/mã giảm giá đã tồn tại" });

            var promotion = new Promotion
            {
                Name = normalizedName,
                PromoType = string.IsNullOrWhiteSpace(dto.PromoType) ? "percent" : dto.PromoType.Trim(),
                Value = dto.Value,
                MinOrder = dto.MinOrder,
                StartDate = dto.StartDate ?? DateTime.Now,
                EndDate = dto.EndDate,
                IsActive = dto.IsActive ?? true,
                CreatedAt = DateTime.Now
            };

            _dbContext.Promotions.Add(promotion);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = promotion.Id }, promotion);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PromotionDto dto)
        {
            var promotion = await _dbContext.Promotions.FindAsync(id);
            if (promotion == null)
                return NotFound(new { message = "Không tìm thấy mã giảm giá" });

            var normalizedName = dto.Name.Trim();
            if (string.IsNullOrWhiteSpace(normalizedName))
                return BadRequest(new { message = "Tên/mã giảm giá là bắt buộc" });

            var exists = await _dbContext.Promotions.AnyAsync(p => p.Id != id && p.Name == normalizedName);
            if (exists)
                return BadRequest(new { message = "Tên/mã giảm giá đã tồn tại" });

            promotion.Name = normalizedName;
            promotion.PromoType = string.IsNullOrWhiteSpace(dto.PromoType) ? promotion.PromoType : dto.PromoType.Trim();
            promotion.Value = dto.Value;
            promotion.MinOrder = dto.MinOrder;
            promotion.StartDate = dto.StartDate ?? promotion.StartDate;
            promotion.EndDate = dto.EndDate;
            promotion.IsActive = dto.IsActive ?? promotion.IsActive;

            await _dbContext.SaveChangesAsync();
            return Ok(promotion);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var promotion = await _dbContext.Promotions.FindAsync(id);
            if (promotion == null)
                return NotFound(new { message = "Không tìm thấy mã giảm giá" });

            _dbContext.Promotions.Remove(promotion);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Đã xóa mã giảm giá" });
        }
    }

    public class PromotionDto
    {
        public string Name { get; set; } = "";
        public string PromoType { get; set; } = "percent";
        public decimal Value { get; set; }
        public decimal MinOrder { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool? IsActive { get; set; }
    }
}

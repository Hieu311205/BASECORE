using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Repository;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    // Sổ địa chỉ của khách hàng: một khách có thể lưu nhiều địa chỉ nhận hàng.
    // Cho phép gọi không cần đăng nhập (demo) - userId lấy từ JWT hoặc query/body.
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class AddressesController : ControllerBase
    {
        private readonly MySqlDbContext _dbContext;
        private readonly ILogger<AddressesController> _logger;

        public AddressesController(MySqlDbContext dbContext, ILogger<AddressesController> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        // GET /api/addresses?userId=16  -> danh sách địa chỉ của 1 khách (mặc định lên đầu)
        [HttpGet]
        public async Task<IActionResult> GetMine([FromQuery] int? userId)
        {
            var uid = ResolveUserId(userId);
            if (uid == 0)
                return BadRequest(new ApiResponse<object>(null, "UserId is required"));

            var addresses = await _dbContext.UserAddresses
                .Where(a => a.UserId == uid)
                .OrderByDescending(a => a.IsDefault)
                .ThenByDescending(a => a.CreatedAt)
                .ToListAsync();

            return Ok(new ApiResponse<object>(addresses));
        }

        // GET /api/addresses/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var address = await _dbContext.UserAddresses.FindAsync(id);
            if (address == null)
                return NotFound(new ApiResponse<object>(null, "Address not found"));

            return Ok(new ApiResponse<object>(address));
        }

        // POST /api/addresses
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AddressDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponse<object>(null, "Invalid address data"));

            var uid = ResolveUserId(dto.UserId);
            if (uid == 0)
                return BadRequest(new ApiResponse<object>(null, "UserId is required"));

            var userExists = await _dbContext.Users.AnyAsync(u => u.Id == uid);
            if (!userExists)
                return BadRequest(new ApiResponse<object>(null, $"UserId {uid} does not exist."));

            // Nếu là địa chỉ đầu tiên của khách thì tự đặt làm mặc định.
            var hasAny = await _dbContext.UserAddresses.AnyAsync(a => a.UserId == uid);
            var makeDefault = dto.IsDefault || !hasAny;

            if (makeDefault)
                await ClearDefaultAsync(uid);

            var address = new UserAddress
            {
                UserId = uid,
                Label = dto.Label?.Trim() ?? "",
                Recipient = dto.Recipient?.Trim() ?? "",
                Phone = dto.Phone?.Trim() ?? "",
                Address = dto.Address?.Trim() ?? "",
                IsDefault = makeDefault,
                CreatedAt = DateTime.Now
            };

            _dbContext.UserAddresses.Add(address);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = address.Id },
                new ApiResponse<object>(address));
        }

        // PUT /api/addresses/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] AddressDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponse<object>(null, "Invalid address data"));

            var address = await _dbContext.UserAddresses.FindAsync(id);
            if (address == null)
                return NotFound(new ApiResponse<object>(null, "Address not found"));

            address.Label = dto.Label?.Trim() ?? address.Label;
            address.Recipient = dto.Recipient?.Trim() ?? address.Recipient;
            address.Phone = dto.Phone?.Trim() ?? address.Phone;
            address.Address = dto.Address?.Trim() ?? address.Address;

            // Đặt làm mặc định nếu được yêu cầu (và bỏ mặc định các địa chỉ khác).
            if (dto.IsDefault && !address.IsDefault)
            {
                await ClearDefaultAsync(address.UserId);
                address.IsDefault = true;
            }

            await _dbContext.SaveChangesAsync();
            return Ok(new ApiResponse<object>(address));
        }

        // PUT /api/addresses/{id}/default
        [HttpPut("{id}/default")]
        public async Task<IActionResult> SetDefault(int id)
        {
            var address = await _dbContext.UserAddresses.FindAsync(id);
            if (address == null)
                return NotFound(new ApiResponse<object>(null, "Address not found"));

            await ClearDefaultAsync(address.UserId);
            address.IsDefault = true;
            await _dbContext.SaveChangesAsync();

            return Ok(new ApiResponse<object>(address));
        }

        // DELETE /api/addresses/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var address = await _dbContext.UserAddresses.FindAsync(id);
            if (address == null)
                return NotFound(new ApiResponse<object>(null, "Address not found"));

            var wasDefault = address.IsDefault;
            var userId = address.UserId;

            _dbContext.UserAddresses.Remove(address);
            await _dbContext.SaveChangesAsync();

            // Nếu xóa địa chỉ mặc định thì gán mặc định cho địa chỉ còn lại mới nhất.
            if (wasDefault)
            {
                var next = await _dbContext.UserAddresses
                    .Where(a => a.UserId == userId)
                    .OrderByDescending(a => a.CreatedAt)
                    .FirstOrDefaultAsync();
                if (next != null)
                {
                    next.IsDefault = true;
                    await _dbContext.SaveChangesAsync();
                }
            }

            return Ok(new ApiResponse<object>(null, "Address deleted"));
        }

        private async Task ClearDefaultAsync(int userId)
        {
            var defaults = await _dbContext.UserAddresses
                .Where(a => a.UserId == userId && a.IsDefault)
                .ToListAsync();
            foreach (var a in defaults)
                a.IsDefault = false;
        }

        // Ưu tiên userId từ JWT (nếu đăng nhập), nếu không thì dùng giá trị client gửi lên.
        private int ResolveUserId(int? fromRequest)
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(claim, out var fromToken) && fromToken > 0)
                return fromToken;
            return fromRequest ?? 0;
        }
    }

    public class AddressDto
    {
        public int? UserId { get; set; }

        public string? Label { get; set; }

        [Required(ErrorMessage = "Recipient is required")]
        public string Recipient { get; set; } = "";

        [Required(ErrorMessage = "Phone is required")]
        public string Phone { get; set; } = "";

        [Required(ErrorMessage = "Address is required")]
        public string Address { get; set; } = "";

        public bool IsDefault { get; set; }
    }
}

using BaseCore.Entities;
using BaseCore.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class SettingsController : ControllerBase
    {
        private readonly MySqlDbContext _dbContext;

        public SettingsController(MySqlDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("{scope}")]
        public async Task<IActionResult> Get(string scope)
        {
            var normalizedScope = NormalizeScope(scope);
            var setting = await _dbContext.AdminSettings.FirstOrDefaultAsync(item => item.Scope == normalizedScope);

            if (setting == null)
            {
                return Ok(new { scope = normalizedScope, value = GetDefaultValue(normalizedScope) });
            }

            return Ok(new
            {
                scope = setting.Scope,
                value = JsonSerializer.Deserialize<object>(setting.JsonValue),
                updatedAt = setting.UpdatedAt
            });
        }

        [HttpPut("{scope}")]
        public async Task<IActionResult> Save(string scope, [FromBody] JsonElement value)
        {
            var normalizedScope = NormalizeScope(scope);
            var setting = await _dbContext.AdminSettings.FirstOrDefaultAsync(item => item.Scope == normalizedScope);
            var jsonValue = value.GetRawText();

            if (setting == null)
            {
                setting = new AdminSetting
                {
                    Scope = normalizedScope,
                    JsonValue = jsonValue,
                    UpdatedAt = DateTime.Now
                };
                _dbContext.AdminSettings.Add(setting);
            }
            else
            {
                setting.JsonValue = jsonValue;
                setting.UpdatedAt = DateTime.Now;
            }

            await _dbContext.SaveChangesAsync();
            return Ok(new { scope = normalizedScope, value });
        }

        private static string NormalizeScope(string scope)
        {
            return string.IsNullOrWhiteSpace(scope) ? "store" : scope.Trim().ToLower();
        }

        private static object GetDefaultValue(string scope)
        {
            if (scope == "shipping")
            {
                return new
                {
                    defaultFee = 30000,
                    freeShippingThreshold = 1000000,
                    deliveryProvider = "Giao hàng nội bộ",
                    trackingUrlTemplate = "",
                    enabled = true
                };
            }

            return new
            {
                storeName = "BaseCore Sales",
                email = "",
                phone = "",
                address = "",
                currency = "VND",
                taxRate = 0,
                maintenanceMode = false
            };
        }
    }
}

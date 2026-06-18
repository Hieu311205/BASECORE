using BaseCore.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class ReportsController : ControllerBase
    {
        private readonly MySqlDbContext _dbContext;

        public ReportsController(MySqlDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary(
            [FromQuery] string mode = "week",
            [FromQuery] DateTime? date = null,
            [FromQuery] string? month = null,
            [FromQuery] int lowStockThreshold = 10,
            [FromQuery] int topProductsLimit = 10)
        {
            var period = ResolvePeriod(mode, date, month);
            lowStockThreshold = lowStockThreshold < 0 ? 10 : lowStockThreshold;
            topProductsLimit = topProductsLimit < 1 ? 10 : Math.Min(topProductsLimit, 50);

            var ordersQuery = _dbContext.Orders.AsNoTracking();
            var productsQuery = _dbContext.Products.AsNoTracking().Where(product => !product.IsDeleted);

            var salesSummary = await ordersQuery
                .GroupBy(_ => 1)
                .Select(group => new
                {
                    TotalRevenue = group.Sum(order => order.TotalAmount),
                    CompletedRevenue = group.Sum(order => order.Status == "Completed" ? order.TotalAmount : 0),
                    PaidRevenue = group.Sum(order => order.PaymentStatus == "Paid" ? order.TotalAmount : 0),
                    TotalOrders = group.Count()
                })
                .FirstOrDefaultAsync();

            var selectedPeriodSummary = await ordersQuery
                .Where(order => order.OrderDate >= period.Start && order.OrderDate < period.EndExclusive)
                .GroupBy(_ => 1)
                .Select(group => new
                {
                    Revenue = group.Sum(order => order.TotalAmount),
                    Orders = group.Count()
                })
                .FirstOrDefaultAsync();

            var revenueRows = await ordersQuery
                .Where(order => order.OrderDate >= period.Start && order.OrderDate < period.EndExclusive)
                .GroupBy(order => order.OrderDate.Date)
                .Select(group => new
                {
                    Date = group.Key,
                    Revenue = group.Sum(order => order.TotalAmount),
                    Orders = group.Count()
                })
                .ToListAsync();

            var revenueByDate = revenueRows.ToDictionary(
                item => item.Date.ToString("yyyy-MM-dd"),
                item => new ReportSeriesPointDto
                {
                    Date = item.Date.ToString("yyyy-MM-dd"),
                    Revenue = item.Revenue,
                    Orders = item.Orders
                });
            var revenueSeries = BuildDateSeries(period.Start, period.Days)
                .Select(dateKey => revenueByDate.TryGetValue(dateKey, out var value)
                    ? value
                    : new ReportSeriesPointDto { Date = dateKey, Revenue = 0, Orders = 0 })
                .ToList();

            var statusRows = await ordersQuery
                .GroupBy(order => string.IsNullOrEmpty(order.Status) ? "Unknown" : order.Status)
                .Select(group => new StatusReportDto
                {
                    Status = group.Key,
                    Count = group.Count(),
                    Revenue = group.Sum(order => order.TotalAmount)
                })
                .ToListAsync();

            var paymentRows = await ordersQuery
                .GroupBy(order => string.IsNullOrEmpty(order.PaymentStatus) ? "Unpaid" : order.PaymentStatus)
                .Select(group => new CountReportDto
                {
                    Status = group.Key,
                    Count = group.Count()
                })
                .ToListAsync();

            var lowStockProducts = await productsQuery
                .Where(product => product.Stock <= lowStockThreshold)
                .OrderBy(product => product.Stock)
                .ThenBy(product => product.Name)
                .Take(20)
                .Select(product => new LowStockProductDto
                {
                    Id = product.Id,
                    Name = product.Name,
                    Sku = product.Sku,
                    Stock = product.Stock
                })
                .ToListAsync();

            var topProducts = await _dbContext.OrderDetails.AsNoTracking()
                .Join(
                    _dbContext.Products.AsNoTracking(),
                    detail => detail.ProductId,
                    product => product.Id,
                    (detail, product) => new { detail, product })
                .GroupBy(item => new { item.detail.ProductId, item.product.Name })
                .Select(group => new TopProductDto
                {
                    ProductId = group.Key.ProductId,
                    Name = group.Key.Name,
                    QuantitySold = group.Sum(item => item.detail.Quantity),
                    Revenue = group.Sum(item => item.detail.Quantity * item.detail.UnitPrice)
                })
                .OrderByDescending(item => item.QuantitySold)
                .ThenByDescending(item => item.Revenue)
                .Take(topProductsLimit)
                .ToListAsync();

            var result = new ReportSummaryDto
            {
                Period = new ReportPeriodDto
                {
                    Mode = period.Mode,
                    StartDate = period.Start.ToString("yyyy-MM-dd"),
                    EndDate = period.EndInclusive.ToString("yyyy-MM-dd"),
                    Label = period.Label
                },
                Sales = new SalesSummaryDto
                {
                    TotalRevenue = salesSummary?.TotalRevenue ?? 0,
                    CompletedRevenue = salesSummary?.CompletedRevenue ?? 0,
                    PaidRevenue = salesSummary?.PaidRevenue ?? 0,
                    TotalOrders = salesSummary?.TotalOrders ?? 0,
                    SelectedPeriodRevenue = selectedPeriodSummary?.Revenue ?? 0,
                    SelectedPeriodOrders = selectedPeriodSummary?.Orders ?? 0
                },
                Counts = new ReportCountsDto
                {
                    Products = await productsQuery.CountAsync(),
                    ActiveProducts = await productsQuery.CountAsync(product => product.IsActive),
                    InactiveProducts = await productsQuery.CountAsync(product => !product.IsActive),
                    Categories = await _dbContext.Categories.AsNoTracking().CountAsync(category => !category.IsDeleted),
                    Suppliers = await _dbContext.Suppliers.AsNoTracking().CountAsync(supplier => !supplier.IsDeleted),
                    Users = await _dbContext.Users.AsNoTracking().CountAsync()
                },
                RevenueSeries = revenueSeries,
                Statuses = statusRows,
                Payments = paymentRows,
                LowStockProducts = lowStockProducts,
                TopProducts = topProducts
            };

            return Ok(result);
        }

        private static ReportPeriod ResolvePeriod(string mode, DateTime? date, string? month)
        {
            if (string.Equals(mode, "month", StringComparison.OrdinalIgnoreCase))
            {
                var today = DateTime.Today;
                var year = today.Year;
                var monthNumber = today.Month;

                if (!string.IsNullOrWhiteSpace(month))
                {
                    var parts = month.Split('-', StringSplitOptions.RemoveEmptyEntries);
                    if (parts.Length == 2 && int.TryParse(parts[0], out var parsedYear) && int.TryParse(parts[1], out var parsedMonth))
                    {
                        year = parsedYear;
                        monthNumber = Math.Clamp(parsedMonth, 1, 12);
                    }
                }

                var start = new DateTime(year, monthNumber, 1);
                var endExclusive = start.AddMonths(1);
                return new ReportPeriod("month", start, endExclusive, $"{year}-{monthNumber:00}");
            }

            var selectedDate = (date ?? DateTime.Today).Date;
            var day = selectedDate.DayOfWeek == DayOfWeek.Sunday ? 7 : (int)selectedDate.DayOfWeek;
            var weekStart = selectedDate.AddDays(1 - day);
            var weekEndExclusive = weekStart.AddDays(7);
            return new ReportPeriod("week", weekStart, weekEndExclusive, $"{weekStart:MM-dd} to {weekEndExclusive.AddDays(-1):MM-dd}");
        }

        private static IEnumerable<string> BuildDateSeries(DateTime start, int days)
        {
            for (var index = 0; index < days; index++)
            {
                yield return start.AddDays(index).ToString("yyyy-MM-dd");
            }
        }

        private sealed record ReportPeriod(string Mode, DateTime Start, DateTime EndExclusive, string Label)
        {
            public DateTime EndInclusive => EndExclusive.AddDays(-1);
            public int Days => (EndExclusive - Start).Days;
        }
    }

    public class ReportSummaryDto
    {
        public ReportPeriodDto Period { get; set; } = new();
        public SalesSummaryDto Sales { get; set; } = new();
        public ReportCountsDto Counts { get; set; } = new();
        public List<ReportSeriesPointDto> RevenueSeries { get; set; } = new();
        public List<StatusReportDto> Statuses { get; set; } = new();
        public List<CountReportDto> Payments { get; set; } = new();
        public List<LowStockProductDto> LowStockProducts { get; set; } = new();
        public List<TopProductDto> TopProducts { get; set; } = new();
    }

    public class ReportPeriodDto
    {
        public string Mode { get; set; } = "";
        public string StartDate { get; set; } = "";
        public string EndDate { get; set; } = "";
        public string Label { get; set; } = "";
    }

    public class SalesSummaryDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal CompletedRevenue { get; set; }
        public decimal PaidRevenue { get; set; }
        public int TotalOrders { get; set; }
        public decimal SelectedPeriodRevenue { get; set; }
        public int SelectedPeriodOrders { get; set; }
    }

    public class ReportCountsDto
    {
        public int Products { get; set; }
        public int ActiveProducts { get; set; }
        public int InactiveProducts { get; set; }
        public int Categories { get; set; }
        public int Suppliers { get; set; }
        public int Users { get; set; }
    }

    public class ReportSeriesPointDto
    {
        public string Date { get; set; } = "";
        public decimal Revenue { get; set; }
        public int Orders { get; set; }
    }

    public class StatusReportDto
    {
        public string Status { get; set; } = "";
        public int Count { get; set; }
        public decimal Revenue { get; set; }
    }

    public class CountReportDto
    {
        public string Status { get; set; } = "";
        public int Count { get; set; }
    }

    public class LowStockProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string? Sku { get; set; }
        public int Stock { get; set; }
    }

    public class TopProductDto
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = "";
        public int QuantitySold { get; set; }
        public decimal Revenue { get; set; }
    }
}

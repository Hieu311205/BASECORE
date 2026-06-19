using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Repository;
using BaseCore.Repository.EFCore;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderRepositoryEF _orderRepository;
        private readonly IOrderDetailRepositoryEF _orderDetailRepository;
        private readonly IProductRepositoryEF _productRepository;
        private readonly MySqlDbContext _dbContext;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(
            IOrderRepositoryEF orderRepository,
            IOrderDetailRepositoryEF orderDetailRepository,
            IProductRepositoryEF productRepository,
            MySqlDbContext dbContext,
            ILogger<OrdersController> logger)
        {
            _orderRepository = orderRepository;
            _orderDetailRepository = orderDetailRepository;
            _productRepository = productRepository;
            _dbContext = dbContext;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out var userInt))
                return Unauthorized();

            var orders = await _orderRepository.GetByUserAsync(userInt);
            return Ok(new ApiResponse<object>(orders));
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllOrders(
            [FromQuery] string? keyword,
            [FromQuery] string? status,
            [FromQuery] string? paymentStatus,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize < 1 ? 10 : pageSize;

            var (orders, totalCount) = await _orderRepository.SearchAsync(keyword, status, page, pageSize, paymentStatus);

            return Ok(new ApiResponse<object>(new
            {
                items = orders,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            }));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return NotFound(new ApiResponse<object>(null, "Order not found"));

            var currentUserId = GetCurrentUserId();
            if (!IsAdmin() && currentUserId != order.UserId)
                return Forbid();

            var details = await _orderDetailRepository.GetByOrderAsync(id);
            return Ok(new ApiResponse<object>(new { order, details }));
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponse<object>(null, "Invalid request data"));

            var orderUserId = dto.UserId ?? GetCurrentUserId() ?? 0;
            if (orderUserId == 0)
                return BadRequest(new ApiResponse<object>(null, "UserId is required"));

            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var userExists = await _dbContext.Users.AnyAsync(u => u.Id == orderUserId);
                if (!userExists)
                    return BadRequest(new ApiResponse<object>(null, $"UserId {orderUserId} does not exist."));

                decimal totalAmount = 0;
                var orderDetails = new List<OrderDetail>();

                foreach (var item in dto.Items)
                {
                    if (item.Quantity <= 0)
                        return BadRequest(new ApiResponse<object>(null, "Quantity must be greater than 0"));

                    var product = await _productRepository.GetByIdAsync(item.ProductId);
                    if (product == null)
                        return BadRequest(new ApiResponse<object>(null, $"Product {item.ProductId} not found"));

                    if (product.Stock < item.Quantity)
                        return BadRequest(new ApiResponse<object>(null, $"Insufficient stock for {product.Name}"));

                    totalAmount += product.Price * item.Quantity;
                    orderDetails.Add(new OrderDetail
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = product.Price
                    });

                    product.Stock -= item.Quantity;
                    await _productRepository.UpdateAsync(product);
                }

                var order = new Order
                {
                    UserId = orderUserId,
                    OrderDate = DateTime.Now,
                    TotalAmount = totalAmount,
                    Status = "Pending",
                    ShippingAddress = dto.ShippingAddress?.Trim() ?? "",
                    RecipientName = dto.RecipientName,
                    RecipientPhone = dto.RecipientPhone,
                    PaymentMethod = string.IsNullOrWhiteSpace(dto.PaymentMethod) ? "COD" : dto.PaymentMethod,
                    // COD luôn Unpaid; ví điện tử/QR đã xác nhận thanh toán phía client thì là Paid.
                    PaymentStatus = string.Equals(dto.PaymentStatus, "Paid", StringComparison.OrdinalIgnoreCase)
                        ? "Paid" : "Unpaid"
                };

                await _orderRepository.AddAsync(order);

                foreach (var detail in orderDetails)
                {
                    detail.OrderId = order.Id;
                    await _orderDetailRepository.AddAsync(detail);
                }

                await transaction.CommitAsync();
                _logger.LogInformation("Order {OrderId} created for user {UserId}", order.Id, orderUserId);

                return CreatedAtAction(nameof(GetById), new { id = order.Id },
                    new ApiResponse<object>(new { order, details = orderDetails }));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Failed to create order for user {UserId}", orderUserId);
                return StatusCode(500, new ApiResponse<object>(null, "Tạo đơn hàng thất bại. Vui lòng thử lại."));
            }
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponse<object>(null, "Invalid status data"));

            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return NotFound(new ApiResponse<object>(null, "Order not found"));

            order.Status = dto.Status;
            order.PaymentStatus = dto.PaymentStatus ?? order.PaymentStatus;
            order.UpdatedAt = DateTime.Now;
            await _orderRepository.UpdateAsync(order);

            return Ok(new ApiResponse<object>(order));
        }

        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return NotFound(new ApiResponse<object>(null, "Order not found"));

            var currentUserId = GetCurrentUserId();
            if (!IsAdmin() && currentUserId != order.UserId)
                return Forbid();

            if (order.Status == "Completed")
                return BadRequest(new ApiResponse<object>(null, "Cannot cancel completed order"));

            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var details = await _orderDetailRepository.GetByOrderAsync(id);
                foreach (var detail in details)
                {
                    var product = await _productRepository.GetByIdAsync(detail.ProductId);
                    if (product != null)
                    {
                        product.Stock += detail.Quantity;
                        await _productRepository.UpdateAsync(product);
                    }
                }

                order.Status = "Cancelled";
                order.UpdatedAt = DateTime.Now;
                await _orderRepository.UpdateAsync(order);
                await transaction.CommitAsync();

                return Ok(new ApiResponse<object>(order, "Order cancelled successfully"));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Failed to cancel order {OrderId}", id);
                return StatusCode(500, new ApiResponse<object>(null, "Hủy đơn hàng thất bại."));
            }
        }

        private bool IsAdmin() => User.IsInRole("Admin");

        private int? GetCurrentUserId()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userId, out var parsed) ? parsed : null;
        }
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Message { get; set; }

        public ApiResponse(T? data, string? message = null)
        {
            Success = message == null;
            Data = data;
            Message = message;
        }
    }

    public class CreateOrderDto
    {
        public int? UserId { get; set; }

        [Required, MinLength(1, ErrorMessage = "Order must have at least one item")]
        public List<OrderItemDto> Items { get; set; } = new();

        public string? ShippingAddress { get; set; }
        public string? RecipientName { get; set; }
        public string? RecipientPhone { get; set; }
        public string? PaymentMethod { get; set; }
        public string? PaymentStatus { get; set; }
    }

    public class OrderItemDto
    {
        [Required]
        public int ProductId { get; set; }

        [Range(1, 1000, ErrorMessage = "Quantity must be between 1 and 1000")]
        public int Quantity { get; set; }
    }

    public class UpdateStatusDto
    {
        [Required(ErrorMessage = "Status is required")]
        public string Status { get; set; } = "";
        public string? PaymentStatus { get; set; }
    }
}

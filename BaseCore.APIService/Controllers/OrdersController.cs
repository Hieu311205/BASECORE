using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Repository;
using BaseCore.Repository.EFCore;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    /// <summary>
    /// Order API Controller
    /// Teaching: RESTful API, Business Logic, Authentication (Bài 10, 11)
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderRepositoryEF _orderRepository;
        private readonly IOrderDetailRepositoryEF _orderDetailRepository;
        private readonly IProductRepositoryEF _productRepository;
        private readonly MySqlDbContext _dbContext;

        public OrdersController(
            IOrderRepositoryEF orderRepository,
            IOrderDetailRepositoryEF orderDetailRepository,
            IProductRepositoryEF productRepository,
            MySqlDbContext dbContext)
        {
            _orderRepository = orderRepository;
            _orderDetailRepository = orderDetailRepository;
            _productRepository = productRepository;
            _dbContext = dbContext;
        }

        /// <summary>
        /// Get orders for current user
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetMyOrders()
        {
            // UserId được lấy từ claim NameIdentifier trong JWT, không lấy từ query để tránh xem nhầm đơn của user khác.
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out var userInt))
                return Unauthorized();

            var orders = await _orderRepository.GetByUserAsync(userInt);
            return Ok(orders);
        }

        /// <summary>
        /// Get all orders (Admin only)
        /// </summary>
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllOrders(
            [FromQuery] string? keyword,
            [FromQuery] string? status,
            [FromQuery] string? paymentStatus,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            // Chuẩn hóa phân trang ở controller trước khi chuyển xuống repository.
            page = page < 1 ? 1 : page;
            pageSize = pageSize < 1 ? 10 : pageSize;

            var (orders, totalCount) = await _orderRepository.SearchAsync(keyword, status, page, pageSize, paymentStatus);

            return Ok(new
            {
                items = orders,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }

        /// <summary>
        /// Get order by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return NotFound(new { message = "Order not found" });

            var currentUserId = GetCurrentUserId();
            if (!IsAdmin() && currentUserId != order.UserId)
                return Forbid();

            var details = await _orderDetailRepository.GetByOrderAsync(id);
            return Ok(new { order, details });
        }

        /// <summary>
        /// Create new order
        /// </summary>
        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
        {
            // Cho phép checkout anonymous trong demo; nếu client không gửi UserId thì gán user mặc định.
            var orderUserId = dto.UserId ?? 16;

            // Đảm bảo UserId tồn tại để không vi phạm foreign key khi tạo đơn hàng.
            var userExists = await _dbContext.Users.AnyAsync(user => user.Id == orderUserId);
            if (!userExists)
            {
                return BadRequest(new { message = $"UserId {orderUserId} does not exist." });
            }

            // Kiểm tra từng sản phẩm, tính tổng tiền và tạo danh sách OrderDetail tạm trước khi lưu Order.
            decimal totalAmount = 0;
            var orderDetails = new List<OrderDetail>();

            foreach (var item in dto.Items)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId);
                if (product == null)
                    return BadRequest(new { message = $"Product {item.ProductId} not found" });

                if (product.Stock < item.Quantity)
                    return BadRequest(new { message = $"Insufficient stock for {product.Name}" });

                totalAmount += product.Price * item.Quantity;
                orderDetails.Add(new OrderDetail
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                });

                // Trừ tồn kho ngay khi tạo đơn để tránh bán vượt số lượng hiện có.
                product.Stock -= item.Quantity;
                await _productRepository.UpdateAsync(product);
            }

            var order = new Order
            {
                // Order lưu thông tin tổng quan; chi tiết sản phẩm được lưu ở OrderDetail bên dưới.
                UserId = orderUserId,
                OrderDate = DateTime.Now,
                TotalAmount = totalAmount,
                Status = "Pending",
                ShippingAddress = BuildShippingAddress(dto),
                RecipientName = dto.RecipientName,
                RecipientPhone = dto.RecipientPhone,
                PaymentMethod = string.IsNullOrWhiteSpace(dto.PaymentMethod) ? "COD" : dto.PaymentMethod,
                PaymentStatus = "Unpaid"
            };

            await _orderRepository.AddAsync(order);

            // Sau khi Order có Id do database sinh ra, gán OrderId cho từng dòng chi tiết.
            foreach (var detail in orderDetails)
            {
                detail.OrderId = order.Id;
                await _orderDetailRepository.AddAsync(detail);
            }

            return CreatedAtAction(nameof(GetById), new { id = order.Id }, new { order, details = orderDetails });
        }

        /// <summary>
        /// Update order status
        /// </summary>
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return NotFound(new { message = "Order not found" });

            order.Status = dto.Status;
            order.PaymentStatus = dto.PaymentStatus ?? order.PaymentStatus;
            order.UpdatedAt = DateTime.Now;
            await _orderRepository.UpdateAsync(order);

            return Ok(order);
        }

        /// <summary>
        /// Cancel order
        /// </summary>
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return NotFound(new { message = "Order not found" });

            var currentUserId = GetCurrentUserId();
            if (!IsAdmin() && currentUserId != order.UserId)
                return Forbid();

            if (order.Status == "Completed")
                return BadRequest(new { message = "Cannot cancel completed order" });

            // Khi hủy đơn, hoàn lại tồn kho đã trừ lúc tạo đơn.
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

            return Ok(new { message = "Order cancelled successfully", order });
        }

        private bool IsAdmin()
        {
            return User.IsInRole("Admin");
        }

        private int? GetCurrentUserId()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userId, out var parsedUserId) ? parsedUserId : null;
        }

        private static string BuildShippingAddress(CreateOrderDto dto)
        {
            // Tách hàm để gom/chuẩn hóa thông tin địa chỉ trước khi lưu vào Order.
            var parts = new List<string>();

            if (!string.IsNullOrWhiteSpace(dto.ShippingAddress))
                parts.Add(dto.ShippingAddress.Trim());

            return string.Join(" | ", parts);
        }
    }

    public class CreateOrderDto
    {
        public int? UserId { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
        public string? ShippingAddress { get; set; }
        public string? RecipientName { get; set; }
        public string? RecipientPhone { get; set; }
        public string? PaymentMethod { get; set; }
    }

    public class OrderItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class UpdateStatusDto
    {
        public string Status { get; set; } = "";
        public string? PaymentStatus { get; set; }
    }

}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    // Controller xử lý các API liên quan đến đơn hàng.
    // URL: /api/orders
    // [Authorize] ở cấp class: toàn bộ action trong controller này đều yêu cầu đăng nhập
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderRepositoryEF _orderRepository;
        private readonly IOrderDetailRepositoryEF _orderDetailRepository;
        private readonly IProductRepositoryEF _productRepository;

        public OrdersController(
            IOrderRepositoryEF orderRepository,
            IOrderDetailRepositoryEF orderDetailRepository,
            IProductRepositoryEF productRepository)
        {
            _orderRepository = orderRepository;
            _orderDetailRepository = orderDetailRepository;
            _productRepository = productRepository;
        }

        // GET /api/orders
        // Lấy danh sách đơn hàng của user đang đăng nhập
        [HttpGet]
        public async Task<IActionResult> GetMyOrders()
        {
            // Lấy UserId từ JWT token (được gán khi đăng nhập ở AuthService)
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out var userInt))
                return Unauthorized(); // Token không hợp lệ hoặc không có userId

            var orders = await _orderRepository.GetByUserAsync(userInt);
            return Ok(orders);
        }

        // GET /api/orders/all
        // Lấy TẤT CẢ đơn hàng trong hệ thống (chỉ Admin mới được dùng)
        [HttpGet("all")]
        [Authorize(Roles = "Admin")] // Ghi đè: chỉ role Admin mới vào được endpoint này
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _orderRepository.GetAllAsync();
            return Ok(orders);
        }

        // GET /api/orders/5
        // Lấy chi tiết một đơn hàng theo id (kèm danh sách sản phẩm)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return NotFound(new { message = "Order not found" });

            // Lấy riêng danh sách chi tiết (OrderDetails) của đơn hàng này
            var details = await _orderDetailRepository.GetByOrderAsync(id);
            return Ok(new { order, details }); // Trả về cả đơn hàng lẫn chi tiết
        }

        // POST /api/orders
        // Tạo đơn hàng mới
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
        {
            // Xác định user đang đặt hàng từ JWT token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out var userInt))
                return Unauthorized();

            decimal totalAmount = 0;
            var orderDetails = new List<OrderDetail>();

            // Duyệt từng sản phẩm trong đơn, kiểm tra tồn tại và tồn kho
            foreach (var item in dto.Items)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId);
                if (product == null)
                    return BadRequest(new { message = $"Product {item.ProductId} not found" });

                // Kiểm tra đủ hàng trong kho
                if (product.Stock < item.Quantity)
                    return BadRequest(new { message = $"Insufficient stock for {product.Name}" });

                // Tính tiền từng dòng và cộng vào tổng
                totalAmount += product.Price * item.Quantity;
                orderDetails.Add(new OrderDetail
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price // Lưu giá tại thời điểm đặt (không đổi về sau)
                });

                // Trừ tồn kho ngay khi đặt hàng
                product.Stock -= item.Quantity;
                await _productRepository.UpdateAsync(product);
            }

            // Tạo đơn hàng
            var order = new Order
            {
                UserId = userInt,
                OrderDate = DateTime.Now,
                TotalAmount = totalAmount,
                Status = "Pending",
                ShippingAddress = dto.ShippingAddress ?? ""
            };

            await _orderRepository.AddAsync(order);

            // Lưu từng dòng chi tiết đơn hàng
            foreach (var detail in orderDetails)
            {
                detail.OrderId = order.Id; // Gán OrderId sau khi Order đã được tạo (có Id)
                await _orderDetailRepository.AddAsync(detail);
            }

            return CreatedAtAction(nameof(GetById), new { id = order.Id }, new { order, details = orderDetails });
        }

        // PUT /api/orders/5/status
        // Cập nhật trạng thái đơn hàng (Pending → Completed, hoặc các trạng thái khác)
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return NotFound(new { message = "Order not found" });

            order.Status = dto.Status;
            await _orderRepository.UpdateAsync(order);

            return Ok(order);
        }

        // PUT /api/orders/5/cancel
        // Hủy đơn hàng và hoàn lại tồn kho cho từng sản phẩm
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return NotFound(new { message = "Order not found" });

            // Không thể hủy đơn đã hoàn thành
            if (order.Status == "Completed")
                return BadRequest(new { message = "Cannot cancel completed order" });

            // Hoàn lại tồn kho cho từng sản phẩm trong đơn
            var details = await _orderDetailRepository.GetByOrderAsync(id);
            foreach (var detail in details)
            {
                var product = await _productRepository.GetByIdAsync(detail.ProductId);
                if (product != null)
                {
                    product.Stock += detail.Quantity; // Cộng lại số lượng đã trừ lúc đặt
                    await _productRepository.UpdateAsync(product);
                }
            }

            order.Status = "Cancelled";
            await _orderRepository.UpdateAsync(order);

            return Ok(new { message = "Order cancelled successfully", order });
        }
    }

    // DTO cho việc tạo đơn hàng mới
    public class CreateOrderDto
    {
        public List<OrderItemDto> Items { get; set; } = new(); // Danh sách sản phẩm cần đặt
        public string? ShippingAddress { get; set; }           // Địa chỉ giao hàng
    }

    // Thông tin một sản phẩm trong đơn hàng
    public class OrderItemDto
    {
        public int ProductId { get; set;}  // Id sản phẩm cần mua
        public int Quantity { get; set; }  // Số lượng cần mua
    }

    // DTO để cập nhật trạng thái đơn hàng
    public class UpdateStatusDto
    {
        public string Status { get; set; } = ""; // Trạng thái mới: "Pending", "Completed", "Cancelled"
    }
}

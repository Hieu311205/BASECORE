namespace BaseCore.Entities
{
    /// <summary>
    /// Các trạng thái hợp lệ của đơn hàng.
    /// Dùng class này thay vì gõ string trực tiếp ("Pending", "Completed"...)
    /// để tránh lỗi typo không bị compiler phát hiện.
    ///
    /// Ví dụ sai:  order.Status = "pending"   → không lỗi compile, nhưng logic sai
    /// Ví dụ đúng: order.Status = OrderStatus.Pending → compiler kiểm tra
    /// </summary>
    public static class OrderStatus
    {
        public const string Pending   = "Pending";   // Vừa đặt, chờ xử lý
        public const string Completed = "Completed"; // Đã hoàn thành
        public const string Cancelled = "Cancelled"; // Đã hủy
    }
}

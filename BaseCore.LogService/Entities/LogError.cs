
using BaseCore.Common;

namespace BaseCore.LogService.Entities
{
    // Lớp lưu log lỗi xảy ra trong hệ thống.
    // Khi có exception (lỗi không xử lý được), ExceptionMiddleware sẽ tạo LogError
    // và lưu vào MongoDB để developer tra cứu sau này.
    public class LogError : Entity
    {
        // Thông tin header của HTTP request gây ra lỗi
        // Ví dụ: "REQUEST HttpMethod: POST, Path: /api/products, Content-Type: application/json"
        public string Header { get; set; }

        // Nội dung body của HTTP request (dữ liệu được gửi lên)
        // Giúp tái hiện lại yêu cầu đã gây ra lỗi
        public string Body { get; set; }

        // Thông báo lỗi (exception message)
        public string Message { get; set; }
    }
}

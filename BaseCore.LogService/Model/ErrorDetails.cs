using Newtonsoft.Json;

namespace BaseCore.LogService.Model
{
    // Lớp chứa thông tin lỗi trả về cho client dưới dạng JSON.
    // Dùng để chuẩn hóa format response khi có lỗi xảy ra.
    public class ErrorDetails
    {
        // HTTP status code, ví dụ: 400 (Bad Request), 401 (Unauthorized), 500 (Server Error)
        public int StatusCode { get; set; }

        // Thông báo lỗi mô tả vấn đề
        public string Message { get; set; }

        // Override ToString để serialize thành JSON
        // Giúp ghi response trực tiếp: context.Response.WriteAsync(errorDetails.ToString())
        public override string ToString()
        {
            return JsonConvert.SerializeObject(this);
        }
    }
}

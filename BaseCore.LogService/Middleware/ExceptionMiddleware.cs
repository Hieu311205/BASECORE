using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using BaseCore.Common;
using System;
using System.Threading.Tasks;

namespace BaseCore.LogService.Middleware
{
    // Middleware xử lý exception toàn cục cho ứng dụng.
    // Middleware là lớp nằm giữa request và response trong ASP.NET Core pipeline.
    // Mọi request đều đi qua đây → nếu có exception → middleware này bắt và xử lý.
    //
    // Lợi ích:
    // 1. Không cần try-catch trong từng Controller
    // 2. Tự động ghi log lỗi vào MongoDB
    // 3. Trả về response lỗi thống nhất (JSON)
    public class ExceptionMiddleware
    {
        // _next: delegate trỏ đến middleware tiếp theo trong pipeline
        private readonly RequestDelegate _next;
        private readonly ILogErrorService _logErrorService;
        private readonly ILogActionService _logActionService;
        private readonly AppSettings _appSettings;

        public ExceptionMiddleware(
            RequestDelegate next,
            ILogErrorService logErrorService,
            IOptions<AppSettings> appSettings,
            ILogActionService logActionService)
        {
            _logErrorService = logErrorService;
            _next = next;
            _appSettings.Value;  // Lấy giá trị từ IOptions
            _logActionService = logActionService;
        }

        // Phương thức chính được gọi cho mỗi HTTP request
        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                // Chuyển request sang middleware tiếp theo
                // Nếu không có exception → response trả về bình thường
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                // Nếu có exception xảy ra ở bất kỳ đâu trong pipeline:
                // 1. Ghi log lỗi vào MongoDB
                await _logErrorService.CreateLog(httpContext, ex.Message);

                // 2. Trả về response lỗi có cấu trúc JSON
                await HandleExceptionAsync(httpContext, ex);
            }
        }

        // Xử lý exception và trả về response JSON phù hợp
        private Task HandleExceptionAsync(HttpContext context, Exception error)
        {
            // Trường hợp đặc biệt: SecurityTokenException = token JWT không hợp lệ
            // Trả về 401 Unauthorized thay vì 500 Internal Server Error
            if (error != null && error is SecurityTokenException)
            {
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";

                return context.Response.WriteAsync(JsonConvert.SerializeObject(new
                {
                    StatusCode = context.Response.StatusCode,
                    Msg = "Unauthorized"
                }));
            }

            // Các lỗi khác: trả về 500 Internal Server Error
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";

            return context.Response.WriteAsync(JsonConvert.SerializeObject(new
            {
                StatusCode = context.Response.StatusCode,
                // IsProduction = true → ẩn chi tiết lỗi (tránh lộ thông tin nhạy cảm)
                // IsProduction = false → hiển thị chi tiết lỗi để debug
                Msg = _appSettings.IsProduction
                    ? "Internal Server Error, Please try again!"
                    : error != null ? error.Message : ""
            }));
        }
    }
}

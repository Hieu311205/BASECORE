using Microsoft.AspNetCore.Builder;
using BaseCore.LogService.Middleware;

namespace BaseCore.LogService.Extensions
{
    // Extension methods để đăng ký middleware vào pipeline của ứng dụng.
    // Extension method cho phép gọi như: app.ConfigureCustomExceptionMiddleware()
    // thay vì phải gọi: app.UseMiddleware<ExceptionMiddleware>() trực tiếp trong Program.cs
    public static class MiddlewareExtensions
    {
        // Phiên bản cũ, hiện chưa có implementation
        public static void ConfigureExceptionHandler(this IApplicationBuilder app)
        {
            // Để trống, chưa dùng
        }

        // Đăng ký ExceptionMiddleware vào pipeline để bắt tất cả exception
        // Gọi trong Program.cs: app.ConfigureCustomExceptionMiddleware()
        public static void ConfigureCustomExceptionMiddleware(this IApplicationBuilder app)
        {
            app.UseMiddleware<ExceptionMiddleware>(); // Thêm ExceptionMiddleware vào pipeline
        }
    }
}

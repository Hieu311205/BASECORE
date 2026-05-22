using Ocelot.DependencyInjection;
using Ocelot.Middleware;

// =====================================================================
// API Gateway - Cổng vào duy nhất của toàn bộ hệ thống microservices
// =====================================================================
// API Gateway là điểm trung gian nhận tất cả request từ client,
// sau đó chuyển tiếp (proxy) đến microservice phù hợp.
//
// Luồng request:
//   Client → API Gateway (port 5000) → APIService (port 5001)
//                                    → AuthService (port 5002)
//
// Ocelot là thư viện .NET để xây dựng API Gateway,
// cấu hình routing trong file ocelot.json

var builder = WebApplication.CreateBuilder(args);

// Đọc file ocelot.json chứa cấu hình routing
// optional: false → bắt buộc phải có file này
// reloadOnChange: true → tự reload khi file thay đổi (không cần restart)
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS: cho phép tất cả origin, method, header gọi vào Gateway
// Cần thiết khi frontend (React/Vue...) chạy trên domain khác
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Đăng ký Ocelot vào DI container
builder.Services.AddOcelot();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// Ocelot phải là middleware cuối cùng trong pipeline
// vì nó sẽ xử lý routing và chuyển tiếp request
await app.UseOcelot();

// In ra thông tin các service đang chạy để dễ kiểm tra
Console.WriteLine(@"
╔══════════════════════════════════════════════════════════════╗
║              BaseCore API Gateway                            ║
║══════════════════════════════════════════════════════════════║
║  Gateway:        http://localhost:5000                       ║
║  User Service:   http://localhost:5003                       ║
║  Product Service: http://localhost:5001                      ║
║  Order Service:  http://localhost:5002                       ║
╚══════════════════════════════════════════════════════════════╝
");

app.Run();

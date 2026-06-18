using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using BaseCore.Repository;
using BaseCore.Repository.EFCore;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Đăng ký controller và cấu hình JSON để API nhận request không phân biệt hoa/thường,
// đồng thời tránh vòng lặp khi serialize các entity có quan hệ hai chiều.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();

// Cấu hình Swagger kèm Bearer token để test các endpoint cần đăng nhập ngay trên UI.
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "BaseCore API Service",
        Version = "v1",
        Description = "Business Logic Microservice - Products, Categories, Orders (Bài 10, 11)"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter JWT token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// Cho phép frontend/dev client gọi API từ mọi origin trong môi trường học tập/phát triển.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

builder.Services.AddDbContext<MySqlDbContext>(options =>
{
    // Dùng chung DbContext EF Core cho các repository trong API Service.
    options.UseSqlServer(builder.Configuration.GetConnectionString("ConnectedDb"));
});


// Đăng ký repository theo scope request để mỗi HTTP request dùng một vòng đời DbContext.
builder.Services.AddScoped<IProductRepositoryEF, ProductRepositoryEF>();
builder.Services.AddScoped<ICategoryRepositoryEF, CategoryRepositoryEF>();
builder.Services.AddScoped<IOrderRepositoryEF, OrderRepositoryEF>();
builder.Services.AddScoped<IOrderDetailRepositoryEF, OrderDetailRepositoryEF>();
builder.Services.AddScoped<ISupplierRepositoryEF, SupplierRepositoryEF>();

// Cấu hình xác thực JWT: token hợp lệ mới được truy cập endpoint có [Authorize].
var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:SecretKey"] ?? "YourSecretKeyForAuthenticationShouldBeLongEnough");
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

var app = builder.Build();

// Tự tạo database/schema khi service khởi động nếu database chưa tồn tại.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MySqlDbContext>();
    db.Database.EnsureCreated();
}

// Pipeline xử lý request: Swagger chỉ bật khi Development, sau đó CORS -> Auth -> Controller.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("BaseCore API Service running on port 5001");
Console.WriteLine("Endpoints: /api/products, /api/categories, /api/orders");
app.Run();

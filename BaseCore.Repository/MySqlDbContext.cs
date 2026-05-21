using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository
{
    /// <summary>
    /// DbContext là "cầu nối" giữa code C# và database SQL Server.
    /// Mọi thao tác đọc/ghi database đều đi qua class này.
    /// EF Core dùng class này để biết: có những bảng nào, cấu trúc ra sao, quan hệ thế nào.
    /// </summary>
    public class MySqlDbContext : DbContext
    {
        // Constructor nhận DbContextOptions được cấu hình từ Program.cs
        // (connection string, loại database, v.v.)
        public MySqlDbContext(DbContextOptions<MySqlDbContext> options) : base(options)
        {
        }

        // =====================================================================
        // DbSet = "cổng vào bảng database"
        // Mỗi DbSet<T> đại diện cho một bảng trong SQL Server.
        // Tên property (Users, Products...) sẽ là tên bảng trong database.
        // Ví dụ: _context.Products.Where(...) → SELECT * FROM Products WHERE ...
        // =====================================================================
        public DbSet<User>        Users        { get; set; }
        public DbSet<Product>     Products     { get; set; }
        public DbSet<Category>    Categories   { get; set; }
        public DbSet<Order>       Orders       { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }

        /// <summary>
        /// OnModelCreating được EF Core gọi tự động một lần khi khởi tạo DbContext.
        /// Đây là nơi dùng Fluent API để cấu hình chi tiết từng bảng và quan hệ giữa chúng.
        /// Fluent API = chuỗi phương thức liên tiếp, ví dụ: .HasMaxLength(50).IsRequired()
        /// Kết quả của method này được dùng để tạo migration và sinh ra câu SQL CREATE TABLE.
        /// </summary>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ------------------------------------------------------------------
            // CẤU HÌNH BẢNG Users
            // ------------------------------------------------------------------
            modelBuilder.Entity<User>(entity =>
            {
                // UserName tối đa 50 ký tự, bắt buộc phải có (NOT NULL)
                entity.Property(e => e.UserName).HasMaxLength(50).IsRequired();

                // Password lưu dạng chuỗi hash (base64), tối đa 255 ký tự
                entity.Property(e => e.Password).HasMaxLength(255).IsRequired();

                entity.Property(e => e.Name).HasMaxLength(100);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.Phone).HasMaxLength(20);

                // Tạo unique index trên cột UserName
                // → Không cho phép 2 user có cùng username
                // → SQL: CREATE UNIQUE INDEX IX_Users_UserName ON Users(UserName)
                entity.HasIndex(e => e.UserName).IsUnique();
            });

            // ------------------------------------------------------------------
            // CẤU HÌNH BẢNG Categories
            // ------------------------------------------------------------------
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id); // Khóa chính là cột Id (mặc định, có thể bỏ qua)

                // Tên danh mục tối đa 100 ký tự, bắt buộc phải có
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();

                entity.Property(e => e.Description).HasMaxLength(500);
            });

            // ------------------------------------------------------------------
            // CẤU HÌNH BẢNG Products
            // ------------------------------------------------------------------
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Name).HasMaxLength(200).IsRequired();

                // HasPrecision(18, 2): kiểu số thập phân, tối đa 18 chữ số, 2 số sau dấu phẩy
                // → SQL: DECIMAL(18, 2) — phù hợp lưu giá tiền
                entity.Property(e => e.Price).HasPrecision(18, 2);

                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.ImageUrl).HasMaxLength(500);

                // QUAN HỆ Product → Category (nhiều Product thuộc 1 Category)
                // HasOne: mỗi Product có 1 Category
                // WithMany: mỗi Category có nhiều Product
                // HasForeignKey: cột CategoryId trong bảng Products là khóa ngoại
                // OnDelete Restrict: KHÔNG cho xóa Category nếu còn Product thuộc về nó
                //   → Bảo vệ dữ liệu, tránh sản phẩm mồ côi không có danh mục
                entity.HasOne(e => e.Category)
                      .WithMany()
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ------------------------------------------------------------------
            // CẤU HÌNH BẢNG Orders
            // ------------------------------------------------------------------
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
                entity.Property(e => e.ShippingAddress).HasMaxLength(500);

                // QUAN HỆ Order → OrderDetail (1 Order có nhiều OrderDetail)
                // HasMany: Order có nhiều OrderDetail
                // WithOne: mỗi OrderDetail thuộc về 1 Order
                // HasForeignKey: cột OrderId trong bảng OrderDetails là khóa ngoại
                // OnDelete Cascade: XÓA Order → tự động xóa luôn tất cả OrderDetail của nó
                //   → Hợp lý vì OrderDetail không có ý nghĩa khi không có đơn hàng chứa nó
                entity.HasMany(e => e.OrderDetails)
                      .WithOne(od => od.Order)
                      .HasForeignKey(od => od.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ------------------------------------------------------------------
            // CẤU HÌNH BẢNG OrderDetails
            // ------------------------------------------------------------------
            modelBuilder.Entity<OrderDetail>(entity =>
            {
                entity.HasKey(e => e.Id);

                // UnitPrice là giá tại thời điểm đặt hàng (khác Price hiện tại của Product)
                // Lưu riêng để tránh sai lệch khi giá sản phẩm thay đổi sau này
                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);

                // Quan hệ ngược lại từ OrderDetail → Order (đã khai báo ở trên từ phía Order)
                entity.HasOne(e => e.Order)
                      .WithMany(o => o.OrderDetails)
                      .HasForeignKey(e => e.OrderId);

                // QUAN HỆ OrderDetail → Product
                // OnDelete Restrict: KHÔNG cho xóa Product nếu còn tồn tại trong đơn hàng nào đó
                //   → Bảo vệ lịch sử đơn hàng, tránh mất thông tin đã mua hàng gì
                entity.HasOne(e => e.Product)
                      .WithMany()
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Gọi hàm tạo dữ liệu mẫu ban đầu
            SeedData(modelBuilder);
        }

        /// <summary>
        /// Seed data = dữ liệu mẫu được chèn sẵn vào database khi migration chạy lần đầu.
        /// Mục đích: app có thể chạy được ngay sau khi deploy mà không cần nhập dữ liệu thủ công.
        /// Lưu ý: nếu thay đổi seed data sau khi đã migration, cần tạo migration mới.
        /// </summary>
        private void SeedData(ModelBuilder modelBuilder)
        {
            // Tạo sẵn 5 danh mục sản phẩm
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Electronics",  Description = "Electronic devices and gadgets" },
                new Category { Id = 2, Name = "Clothing",     Description = "Apparel and fashion items" },
                new Category { Id = 3, Name = "Books",        Description = "Books and publications" },
                new Category { Id = 4, Name = "Home & Garden",Description = "Home and garden products" },
                new Category { Id = 5, Name = "Sports",       Description = "Sports equipment and accessories" }
            );

            // Tạo sẵn 5 sản phẩm mẫu (mỗi cái thuộc 1 danh mục khác nhau)
            // Id phải đặt cố định để EF Core biết dữ liệu này đã tồn tại, không insert lại
            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 1, Name = "Laptop Dell XPS 15", Price = 35000000, Stock = 10,  CategoryId = 1, Description = "High-performance laptop",    ImageUrl = "" },
                new Product { Id = 2, Name = "iPhone 15 Pro",      Price = 28000000, Stock = 15,  CategoryId = 1, Description = "Latest Apple smartphone",    ImageUrl = "" },
                new Product { Id = 3, Name = "T-Shirt Cotton",     Price = 250000,   Stock = 100, CategoryId = 2, Description = "Comfortable cotton t-shirt", ImageUrl = "" },
                new Product { Id = 4, Name = "Programming Book",   Price = 450000,   Stock = 50,  CategoryId = 3, Description = "Learn programming basics",   ImageUrl = "" },
                new Product { Id = 5, Name = "Garden Tools Set",   Price = 850000,   Stock = 25,  CategoryId = 4, Description = "Complete gardening toolkit",  ImageUrl = "" }
            );

            // User seed data được quản lý bởi AuthService
            // Xem UserService.Create() để biết cách tạo user với password đã được hash
        }
    }
}

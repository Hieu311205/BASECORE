using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository
{
    /// <summary>
    /// Entity Framework Core DbContext for MySQL
    /// Used for teaching EF Core concepts (Bài 10)
    /// </summary>
    public class MySqlDbContext : DbContext
    {
        public MySqlDbContext(DbContextOptions<MySqlDbContext> options) : base(options)
        {
        }

        // Mỗi DbSet ánh xạ tới một bảng dữ liệu mà EF Core sẽ query/update.
        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<Wishlist> Wishlists { get; set; }
        public DbSet<UserAddress> UserAddresses { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<OrderLog> OrderLogs { get; set; }
        public DbSet<Promotion> Promotions { get; set; }
        public DbSet<PromotionProduct> PromotionProducts { get; set; }
        public DbSet<PromotionCategory> PromotionCategories { get; set; }
        public DbSet<AdminSetting> AdminSettings { get; set; }
        //public DbSet<Brand> Brands { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Ràng buộc thông tin đăng nhập: username bắt buộc và duy nhất.
            modelBuilder.Entity<User>(entity =>
            {
                //entity.HasKey(e => e.Guid);
                entity.Property(e => e.UserName).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Password).HasMaxLength(255).IsRequired();
                entity.Property(e => e.Name).HasMaxLength(100);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.HasIndex(e => e.UserName).IsUnique();
            });

            // Category là nhóm sản phẩm, dùng soft delete để ẩn dữ liệu thay vì xóa vật lý.
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsDeleted).HasDefaultValue(false);
            });

            // Product là bảng trung tâm của phần bán hàng: giá, tồn kho, SKU/slug và trạng thái hiển thị.
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Price).HasPrecision(18, 2);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                entity.Property(e => e.Sku).HasMaxLength(50);
                entity.Property(e => e.Slug).HasMaxLength(250);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsDeleted).HasDefaultValue(false);
                entity.HasIndex(e => e.Sku).IsUnique().HasFilter("[Sku] IS NOT NULL");
                entity.HasIndex(e => e.Slug).IsUnique().HasFilter("[Slug] IS NOT NULL");

                // Không cascade delete Product khi xóa Category/Supplier để tránh mất dữ liệu bán hàng.
                entity.HasOne(e => e.Category)
                      .WithMany()
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Supplier)
                      .WithMany()
                      .HasForeignKey(e => e.SupplierId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Order lưu tổng tiền, thông tin giao hàng và trạng thái thanh toán.
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
                entity.Property(e => e.ShippingAddress).HasMaxLength(500);
                entity.Property(e => e.RecipientName).HasMaxLength(150);
                entity.Property(e => e.RecipientPhone).HasMaxLength(30);
                entity.Property(e => e.PaymentMethod).HasMaxLength(50).HasDefaultValue("COD");
                entity.Property(e => e.PaymentStatus).HasMaxLength(50).HasDefaultValue("Unpaid");
                // Xóa Order sẽ xóa các dòng OrderDetail vì chi tiết đơn hàng chỉ tồn tại theo đơn hàng.
                entity.HasMany(e => e.OrderDetails)
                      .WithOne(od => od.Order)
                      .HasForeignKey(od => od.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            // OrderDetail lưu snapshot giá tại thời điểm đặt hàng, không phụ thuộc giá Product sau này.
            modelBuilder.Entity<OrderDetail>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);

                entity.HasOne(e => e.Order)
                      .WithMany(o => o.OrderDetails) 
                      .HasForeignKey(e => e.OrderId);

                entity.HasOne(e => e.Product)
                      .WithMany()
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Supplier>(entity =>
            {
                // Supplier quản lý nguồn cung của sản phẩm và cũng dùng soft delete.
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
                entity.Property(e => e.ContactName).HasMaxLength(150);
                entity.Property(e => e.Email).HasMaxLength(150);
                entity.Property(e => e.Phone).HasMaxLength(30);
                entity.Property(e => e.Address).HasMaxLength(500);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsDeleted).HasDefaultValue(false);
            });

            modelBuilder.Entity<Cart>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Quantity).HasDefaultValue(1);
                entity.HasIndex(e => new { e.UserId, e.ProductId }).IsUnique();

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Product)
                      .WithMany()
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Wishlist>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.ProductId }).IsUnique();

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Product)
                      .WithMany()
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserAddress>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Label).HasMaxLength(100);
                entity.Property(e => e.Recipient).HasMaxLength(150).IsRequired();
                entity.Property(e => e.Phone).HasMaxLength(30);
                entity.Property(e => e.Address).HasMaxLength(500).IsRequired();
                entity.Property(e => e.IsDefault).HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ProductImage>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ImageUrl).HasMaxLength(500).IsRequired();
                entity.Property(e => e.AltText).HasMaxLength(250);
                entity.Property(e => e.IsPrimary).HasDefaultValue(false);
                entity.Property(e => e.SortOrder).HasDefaultValue(0);

                entity.HasOne(e => e.Product)
                      .WithMany()
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<OrderLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.OldStatus).HasMaxLength(50);
                entity.Property(e => e.NewStatus).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Note).HasMaxLength(500);
                entity.Property(e => e.ChangedAt).HasDefaultValueSql("GETDATE()");

                entity.HasOne(e => e.Order)
                      .WithMany()
                      .HasForeignKey(e => e.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.ChangedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.ChangedBy)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<Promotion>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(150).IsRequired();
                entity.Property(e => e.PromoType).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Value).HasPrecision(18, 2);
                entity.Property(e => e.MinOrder).HasPrecision(18, 2);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<PromotionProduct>(entity =>
            {
                entity.HasKey(e => new { e.PromotionId, e.ProductId });

                entity.HasOne(e => e.Promotion)
                      .WithMany(e => e.PromotionProducts)
                      .HasForeignKey(e => e.PromotionId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Product)
                      .WithMany()
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PromotionCategory>(entity =>
            {
                entity.HasKey(e => new { e.PromotionId, e.CategoryId });

                entity.HasOne(e => e.Promotion)
                      .WithMany(e => e.PromotionCategories)
                      .HasForeignKey(e => e.PromotionId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Category)
                      .WithMany()
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<AdminSetting>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Scope).HasMaxLength(100).IsRequired();
                entity.Property(e => e.JsonValue).IsRequired();
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETDATE()");
                entity.HasIndex(e => e.Scope).IsUnique();
            });
//             modelBuilder.Entity<Brand>(entity =>
//          {
//              entity.HasKey(e => e.Id);
//              entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
//              entity.Property(e => e.Description).HasMaxLength(500);
//              entity.Property(e => e.IsActive).HasDefaultValue(true);
//              entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
//              entity.Property(e => e.IsDeleted).HasDefaultValue(false);
//          });

            // Seed dữ liệu mẫu để project có danh mục/sản phẩm ngay sau khi tạo database.
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed Categories
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Electronics", Description = "Electronic devices and gadgets" },
                new Category { Id = 2, Name = "Clothing", Description = "Apparel and fashion items" },
                new Category { Id = 3, Name = "Books", Description = "Books and publications" },
                new Category { Id = 4, Name = "Home & Garden", Description = "Home and garden products" },
                new Category { Id = 5, Name = "Sports", Description = "Sports equipment and accessories" }
            );

            // Seed Products
            modelBuilder.Entity<Product>().HasData(
                    new Product { Id = 1, Name = "Laptop Dell XPS 15", Price = 35000000, Stock = 10, CategoryId = 1, Description = "High-performance laptop", ImageUrl = "", IsActive = true },
                    new Product { Id = 2, Name = "iPhone 15 Pro", Price = 28000000, Stock = 15, CategoryId = 1, Description = "Latest Apple smartphone", ImageUrl = "", IsActive = true },
                    new Product { Id = 3, Name = "T-Shirt Cotton", Price = 250000, Stock = 100, CategoryId = 2, Description = "Comfortable cotton t-shirt", ImageUrl = "", IsActive = false },
                    new Product { Id = 4, Name = "Programming Book", Price = 450000, Stock = 50, CategoryId = 3, Description = "Learn programming basics", ImageUrl = "", IsActive = true },
                    new Product { Id = 5, Name = "Garden Tools Set", Price = 850000, Stock = 25, CategoryId = 4, Description = "Complete gardening toolkit", ImageUrl = "", IsActive = true }
            );

            // Note: Users are managed by AuthService (MongoDB)
            // User seed data is handled by MongoDbContext.SeedDataAsync()
        }
    }
}

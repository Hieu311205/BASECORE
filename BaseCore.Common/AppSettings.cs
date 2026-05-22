namespace BaseCore.Common
{
    // Lớp ánh xạ (mapping) từ phần cấu hình trong appsettings.json.
    // Được inject vào các service thông qua IOptions<AppSettings>.
    // Cấu hình trong appsettings.json:
    // "AppSettings": {
    //   "Secret": "...",
    //   "MinuteExpiredToken": 480,
    //   ...
    // }
    public class AppSettings
    {
        // Khóa bí mật dùng để ký JWT token
        public string Secret { get; set; }

        // Thời gian hết hạn của token (đơn vị: phút)
        public int MinuteExpiredToken { get; set; }

        // true = đang chạy môi trường Production (sẽ ẩn thông báo lỗi chi tiết)
        // false = Development (hiển thị lỗi đầy đủ để debug)
        public bool IsProduction { get; set; }

        // URL host để phục vụ media files (ảnh, video...) khi chạy online
        public string MediaHost { get; set; }

        // URL host media khi chạy trên localhost
        public string LocalMediaHost { get; set; }
    }
}


using BaseCore.Common;

namespace BaseCore.LogService.Entities
{
    // Lớp lưu log hành động của người dùng trong hệ thống.
    // Mỗi khi user thực hiện một thao tác quan trọng (đăng nhập, tạo dữ liệu...),
    // hệ thống ghi lại một bản ghi LogAction vào MongoDB để audit sau này.
    public class LogAction : Entity
    {
        // Tên của hành động hoặc tên người dùng thực hiện
        public string Name { get; set; }

        // Mô tả hành động, ví dụ: "Login", "CreateProduct", "DeleteUser"
        public string Action { get; set; }

        // Địa chỉ IP của máy tính thực hiện hành động
        // Dùng để theo dõi hành động từ đâu (phát hiện truy cập bất thường)
        public string IPAddress { get; set; }

        // Tên máy tính (hostname) trong mạng nội bộ
        public string LocalName { get; set; }
    }
}

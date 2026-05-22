using System;

namespace BaseCore.Entities.Audit
{
    // Interface này định nghĩa các thuộc tính audit (kiểm toán) chuẩn.
    // Bất kỳ Entity nào implement IAuditable đều phải có đủ 5 thuộc tính này.
    // Mục đích: theo dõi ai tạo, ai sửa, khi nào, và đã xóa chưa.
    // Dùng "xóa mềm" (soft delete): không xóa khỏi database, chỉ đánh dấu IsDeleted = true.
    public interface IAuditable
    {
        // Tên người tạo bản ghi
        string CreatedBy { get; set; }

        // Ngày giờ tạo bản ghi
        DateTime Created { get; set; }

        // Tên người sửa bản ghi lần cuối
        string ModifiedBy { get; set; }

        // Ngày giờ sửa bản ghi lần cuối
        DateTime Modified { get; set; }

        // Cờ xóa mềm: true = bản ghi đã bị "xóa" (không hiển thị),
        // nhưng vẫn còn trong database để lưu lịch sử
        bool IsDeleted { get; set; }
    }
}

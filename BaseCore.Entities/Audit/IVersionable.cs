namespace BaseCore.Entities.Audit
{
    // Interface cho các entity cần quản lý phiên bản (versioning).
    // Mỗi lần cập nhật, Version tăng thêm 1.
    // Dùng để phát hiện xung đột khi nhiều người cùng sửa một bản ghi (optimistic concurrency).
    public interface IVersionable
    {
        // Số phiên bản hiện tại của bản ghi
        int Version { get; set; }
    }
}

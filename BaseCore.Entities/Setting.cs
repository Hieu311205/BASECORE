using System;
using System.Collections.Generic;
using BaseCore.Common;
using BaseCore.Entities.Audit;

namespace BaseCore.Entities
{
    // Lớp lưu cài đặt/cấu hình hệ thống.
    // Tương ứng với bảng Settings trong database.
    public class Setting : Entity, IAuditable
    {
        // true = hệ thống đang hoạt động online (kết nối internet)
        public bool IsOnline { get; set; }

        // true = sử dụng 2 camera (ví dụ trong hệ thống robot/giám sát)
        public bool IsTwoCamera { get; set; }

        // Domain của Jitsi (dịch vụ hội nghị video) dùng trong mạng nội bộ
        public string JistiDomain { get; set; }

        // Tên cài đặt / phiên làm việc
        public string Name { get; set; }

        // ===== Các thuộc tính audit =====
        public string CreatedBy { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
        public string ModifiedBy { get; set; }
        public DateTime Modified { get; set; }
        public bool IsDeleted { get; set; }  // Xóa mềm
        public bool IsActive { get; set; }   // Cài đặt đang được áp dụng

        // Domain của Jitsi khi truy cập qua internet (khác với domain nội bộ)
        public string JistiDomainInternet { get; set; }
    }
}

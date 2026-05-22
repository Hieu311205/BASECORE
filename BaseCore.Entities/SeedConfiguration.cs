using BaseCore.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace BaseCore.Entities
{
    // Lớp lưu cấu hình seed (hạt giống) cho robot/thiết bị tự động.
    // "Seed" ở đây là góc quay/di chuyển ban đầu, không phải seed data của database.
    public class SeedConfiguration : Entity
    {
        // Góc seed khi quay phải (đơn vị: độ hoặc đơn vị tùy hệ thống)
        public decimal RightSeed { get; set; }

        // Góc seed khi quay trái
        public decimal LeftSeed { get; set; }

        // Góc seed khi đi lùi
        public decimal BackwardSeed { get; set; }

        // Góc seed khi đi tới
        public decimal ForwardSeed { get; set; }
    }
}

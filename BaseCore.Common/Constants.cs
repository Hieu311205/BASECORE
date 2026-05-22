using System;

namespace BaseCore.Common
{
    // Các hằng số dùng chung trong toàn bộ hệ thống.
    // Dùng static để không cần khởi tạo, truy cập trực tiếp: Constants.PAGE_SIZE_DEFAULT
    public static class Constants
    {
        // Số bản ghi mặc định trên mỗi trang khi phân trang
        public static int PAGE_SIZE_DEFAULT = 10;

        // Định dạng ngày giờ hiển thị (dd/MM/yyyy hh:MM:ss)
        public static string FORMAT_DATE_TIME = "dd/MM/yyyy hh:MM:ss";

        // Định dạng ngày (không có giờ)
        public static string FORMAT_DATE = "dd/MM/yyyy";

        // Prefix cho tất cả cache key trong Redis (để phân biệt với hệ thống khác dùng chung Redis)
        public static string RootCache = "PLM_";

        // ===== Tên bảng trong database (dùng làm prefix cho cache key) =====
        public static string Table_User = "user";
        public static string Table_Role = "role";
        public static string Table_Module = "module";
        public static string Table_Function = "function";
        public static string Table_Doctor = "doctor";
        public static string Table_Area = "area";
        public static string Table_Robot = "robot";
        public static string Table_Camera = "camera";
        public static string Table_RobotVersion = "robotversion";
        public static string Table_Setting = "robotversion";

        // ===== Cache key template cho từng loại data =====
        // {0} = page, {1} = pageSize, {2} = keyword/filter
        // Ví dụ: KeyGetListUser.Format(1, 10, "nguyen") → "user:GetListUser_1_10:nguyen"
        public static string KeyGetListUser         = Table_User         + ":GetListUser_{0}_{1}:{2}";
        public static string KeyGetListRole         = Table_Role         + ":GetListRole_{0}_{1}:{2}";
        public static string KeyGetListModule       = Table_Module       + ":GetListModule_{0}_{1}:{2}";
        public static string KeyGetListFunction     = Table_Function     + ":GetListFunction_{0}_{1}:{2}";
        public static string KeyGetListDoctor       = Table_Doctor       + ":GetListDoctor_{0}_{1}:{2}";
        public static string KeyGetListArea         = Table_Area         + ":GetListArea_{0}_{1}:{2}";
        public static string KeyGetListRobot        = Table_Robot        + ":GetListRobot_{0}_{1}:{2}";
        public static string KeyGetListCamera       = Table_Camera       + ":GetListCamera_{0}_{1}:{2}";
        public static string KeyGetListRobotVersion = Table_RobotVersion + ":GetListRobotVersion_{0}_{1}:{2}";
        public static string KeyGetListSetting      = Table_Setting      + ":GetListSetting_{0}_{1}:{2}";
    }
}

using System.ComponentModel.DataAnnotations;

namespace BaseCore.Common
{
    // Tập hợp các enum (kiểu liệt kê) dùng chung trong hệ thống.
    // Enum giúp code dễ đọc hơn: dùng ActiveStatus.Active thay vì số 1.
    // [Display(Name = "...")]: tên hiển thị trên UI (dùng với EnumHelper để lấy tên)
    public class Enums
    {
        // Trạng thái hoạt động chung (chưa dùng)
        public enum ActiveStatus
        {
            [Display(Name = "INACTIVE")]
            InActive = 0,

            [Display(Name = "ACTIVE")]
            Active = 1
        }

        // Trạng thái task template
        public enum TaskTemplateNameStatus
        {
            [Display(Name = "DRAFT")]
            InActive = 0,

            [Display(Name = "ACTIVE")]
            Active = 1
        }

        // Trạng thái màu sắc
        public enum ColorStatus
        {
            [Display(Name = "Development")]
            Development = 0,

            [Display(Name = "Finish")]
            Finish = 1
        }

        // Loại màu sắc (1, 2, 3)
        public enum ColorType
        {
            [Display(Name = "One")]
            One = 1,

            [Display(Name = "Two")]
            Two = 2,

            [Display(Name = "Three")]
            Three = 3
        }

        // Trạng thái dữ liệu
        public enum DataStatus
        {
            [Display(Name = "Development")]
            Development = 0,

            [Display(Name = "Exist")]
            Exist = 1
        }

        // Loại kích cỡ: tiêu chuẩn hoặc đặt riêng
        public enum SizeRangeType
        {
            [Display(Name = "Standard")]
            Standard = 1,

            [Display(Name = "Special Order")]
            SpecialOrder = 2
        }

        // Phần trên hay dưới (áo/quần)
        public enum SizeRangePart
        {
            [Display(Name = "Upper Part")]
            UpperPart = 1,

            [Display(Name = "Lower Part")]
            LowerPart = 2
        }

        // Giới tính
        public enum SizeRangeGender
        {
            [Display(Name = "Men")]
            Men = 1,

            [Display(Name = "Women")]
            Women = 2,

            [Display(Name = "Kid")]
            Kid = 3,
        }

        // Mùa trong năm (dùng cho bộ sưu tập thời trang)
        public enum TaskSession
        {
            [Display(Name = "Spring")]
            Spring = 0,

            [Display(Name = "Summer")]
            Summer = 1,

            [Display(Name = "Autumn")]
            Autumn = 2,

            [Display(Name = "Winter")]
            Winter = 3
        }

        // Trạng thái task template
        public enum TaskTemplateStatus
        {
            [Display(Name = "STATUS_INACTIVE")]
            InActive = 0,

            [Display(Name = "STATUS_ACTIVE")]
            Active = 1
        }

        // Trạng thái lịch sử task
        public enum TaskHistoryStatus
        {
            [Display(Name = "Draft")]
            InActive = 0,

            [Display(Name = "Active")]
            Active = 1
        }

        // Trạng thái hoạt động (có thêm All = -1 để lọc tất cả)
        public enum StatusActivity
        {
            All = -1,    // Không lọc, lấy tất cả
            InActive = 0,
            Active = 1
        }

        // Loại người dùng
        public enum UserType
        {
            SystemAdmin = 1, // Quản trị viên hệ thống
            Doctor = 2       // Bác sĩ (dùng trong hệ thống y tế)
        }

        // Loại role: hệ thống hay theo cơ quan
        public enum RoleType
        {
            SystemRole = 1,  // Role toàn hệ thống
            AgencyRole = 2   // Role riêng của từng cơ quan/chi nhánh
        }

        // Ngày trong tuần
        public enum DayType
        {
            Monday = 1,
            Tuesday = 2,
            Wenesday = 3, // Lưu ý: typo "Wenesday" thay vì "Wednesday"
            Thursday = 4,
            Friday = 5,
            Saturday = 6,
            Sunday = 0
        }

        // Loại giá (dùng cho hệ thống đặt phòng/dịch vụ)
        public enum PriceType
        {
            Day = 1,      // Theo ngày
            Night = 2,    // Theo đêm
            Hour = 3,     // Theo giờ
            Week = 4,     // Theo tuần
            Month = 5,    // Theo tháng
            Adults = 6,   // Người lớn
            Children = 7  // Trẻ em
        }

        // Loại giao dịch kho
        public enum WareHouseType
        {
            Import = 1, // Nhập kho
            Export = 2, // Xuất kho
            Move = 3    // Chuyển kho
        }

        // Trạng thái phòng (dùng cho hệ thống khách sạn)
        public enum RoomStatusType
        {
            CheckIn = 1,    // Đã check in
            OverDue = 2,    // Quá hạn
            Booked = 3,     // Đã đặt trước
            CheckOut = 4,   // Đã check out
            NotArrive = 5,  // Chưa đến
            Repair = 6,     // Đang sửa chữa
            Dirty = 7,      // Cần dọn
            Available = 8,  // Sẵn sàng
            Abort = 9       // Hủy
        }

        // Loại giá đặt phòng
        public enum ReservePriceType
        {
            ManualPrice = 1, // Nhập giá thủ công
            FreePrice = 2,   // Giá tự do
        }

        // Loại media file
        public enum MediaType
        {
            [Display(Name = "Không xác định")]
            Unkown = 0,

            [Display(Name = "Hình ảnh")]
            Image = 1,

            [Display(Name = "Video")]
            Video = 2,

            [Display(Name = "Doc")]
            Doc = 3,

            [Display(Name = "Pdf")]
            Pdf = 4,

            [Display(Name = "File")]
            File = 5,
        }
    }
}

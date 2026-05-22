namespace BaseCore.Common
{
    // Các hằng số tên Role và Permission dùng trong hệ thống phân quyền.
    // Dùng const string thay vì hardcode string trực tiếp → tránh lỗi gõ sai tên.
    // Ví dụ: [Authorize(Roles = RoleConstant.Admin)] thay vì [Authorize(Roles = "Admin")]
    public static class RoleConstant
    {
        // Tên các role cơ bản
        public const string Admin = "Admin";
        public const string User = "User";

        // Tên claim type dùng để lưu role trong JWT token
        public const string ClaimTypeRole = "role";

        #region Role Management Permissions (Quản lý vai trò)

        public const string RoleView             = "Role_View";             // Xem danh sách role
        public const string RoleCreate           = "Role_Create";           // Tạo role mới
        public const string RoleEdit             = "Role_Edit";             // Sửa thông tin role
        public const string RoleDelete           = "Role_Delete";           // Xóa role
        public const string RoleGrantPermission  = "Role_GrantPermission";  // Cấp quyền cho role
        public const string RoleGrantColumn      = "Role_GrantColumn";      // Cấp quyền cột dữ liệu

        #endregion

        #region Module Management Permissions (Quản lý module)

        public const string ModuleView            = "Module_View";
        public const string ModuleCreate          = "Module_Create";
        public const string ModuleEdit            = "Module_Edit";
        public const string ModuleDelete          = "Module_Delete";
        public const string ModuleGrantPermission = "Module_GrantPermission";
        public const string ModuleGrantColumn     = "Module_GrantColumn";

        #endregion

        #region User Management Permissions (Quản lý người dùng)

        public const string UserView     = "UserManagement_View";
        public const string UserCreate   = "UserManagement_Create";
        public const string UserEdit     = "UserManagement_Edit";
        public const string UserDelete   = "UserManagement_Delete";
        public const string UserInActive = "UserManagement_InActive"; // Vô hiệu hóa tài khoản

        #endregion

        #region Contract Permissions (Quản lý hợp đồng)

        public const string ContractView   = "Contract_View";
        public const string ContractCreate = "Contract_Create";
        public const string ContractEdit   = "Contract_Edit";
        public const string ContractDelete = "Contract_Delete";

        #endregion

        #region Doctor Permissions (Quản lý bác sĩ)

        public const string DoctorView   = "Doctor_View";
        public const string DoctorCreate = "Doctor_Create";
        public const string DoctorEdit   = "Doctor_Edit";
        public const string DoctorDelete = "Doctor_Delete";

        #endregion

        #region Area Permissions (Quản lý khu vực)

        public const string AreaView   = "Area_View";
        public const string AreaCreate = "Area_Create";
        public const string AreaEdit   = "Area_Edit";
        public const string AreaDelete = "Area_Delete";

        #endregion

        #region Robot Permissions (Quản lý robot)

        public const string RobotView   = "Robot_View";
        public const string RobotCreate = "Robot_Create";
        public const string RobotEdit   = "Robot_Edit";
        public const string RobotDelete = "Robot_Delete";

        #endregion

        #region Camera Permissions (Quản lý camera)

        public const string CameraView   = "Camera_View";
        public const string CameraCreate = "Camera_Create";
        public const string CameraEdit   = "Camera_Edit";
        public const string CameraDelete = "Camera_Delete";

        #endregion

        #region RobotVersion Permissions (Quản lý phiên bản robot)

        public const string RobotVersionView   = "RobotVersion_View";
        public const string RobotVersionCreate = "RobotVersion_Create";
        public const string RobotVersionEdit   = "RobotVersion_Edit";
        public const string RobotVersionDelete = "RobotVersion_Delete";

        #endregion
    }
}

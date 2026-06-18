import React, { useState, useEffect } from 'react';
import { rolesApi, userApi } from '../services/api';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([
        { id: 2, name: 'Người dùng', userType: 0, description: 'Người dùng thông thường' },
        { id: 1, name: 'Quản trị viên', userType: 1, description: 'Quản trị viên toàn quyền' },
    ]);
    const [permissionsByUserType, setPermissionsByUserType] = useState({});
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        email: '',
        phone: '',
        position: '',
        image: '',
        userType: 0,
        isActive: true,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        loadRoles();
    }, []);

    useEffect(() => {
        loadUsers();
    }, [page, keyword, statusFilter]);

    const loadRoles = async () => {
        try {
            const response = await rolesApi.getAll();
            const assignableRoles = (Array.isArray(response.data) ? response.data : [])
                .filter((role) => role.userType === 0 || role.userType === 1)
                .sort((a, b) => a.userType - b.userType);

            if (assignableRoles.length > 0) {
                setRoles(assignableRoles);
            }

            const permissionEntries = await Promise.all(
                assignableRoles.map(async (role) => {
                    try {
                        const permissionsResponse = await rolesApi.getPermissions(role.id);
                        return [role.userType, permissionsResponse.data?.permissions || []];
                    } catch {
                        return [role.userType, []];
                    }
                })
            );

            setPermissionsByUserType(Object.fromEntries(permissionEntries));
        } catch {
            setPermissionsByUserType({
                0: ['products.read', 'orders.read', 'categories.read'],
                1: ['users.read', 'users.write', 'products.write', 'orders.write', 'categories.write'],
            });
        }
    };

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await userApi.getAll({
                keyword,
                page,
                pageSize,
                isActive: statusFilter === '' ? undefined : statusFilter,
            });
            setUsers(response.data.data || []);
            setTotalPages(response.data.totalPages || 0);
            setTotalCount(response.data.totalCount || 0);
        } catch (error) {
            console.error('Không thể tải người dùng:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        loadUsers();
    };

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                password: '',
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                position: user.position || '',
                image: user.image || '',
                userType: user.userType || 0,
                isActive: user.isActive,
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                password: '',
                name: '',
                email: '',
                phone: '',
                position: '',
                image: '',
                userType: 0,
                isActive: true,
            });
        }
        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingUser) {
                const updateData = {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    position: formData.position,
                    image: formData.image,
                    userType: parseInt(formData.userType),
                    isActive: formData.isActive,
                };
                if (formData.password) {
                    updateData.password = formData.password;
                }
                await userApi.update(editingUser.id, updateData);
            } else {
                if (!formData.password) {
                    setError('Mật khẩu là bắt buộc khi tạo người dùng mới');
                    return;
                }
                await userApi.create({
                    username: formData.username,
                    password: formData.password,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    position: formData.position,
                    image: formData.image,
                    userType: parseInt(formData.userType),
                });
            }

            closeModal();
            loadUsers();
        } catch (error) {
            const data = error.response?.data;
            const validationErrors = data?.errors
                ? Object.values(data.errors).flat().join(' ')
                : '';

            setError(data?.message || validationErrors || 'Thao tác thất bại');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;

        try {
            await userApi.delete(id);
            loadUsers();
        } catch (error) {
            alert('Không thể xóa người dùng');
        }
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i)}>{i}</button>
                </li>
            );
        }
        return pages;
    };

    const getRoleName = (userType) => {
        const roleName = roles.find((role) => role.userType === userType)?.name;
        if (roleName === 'Admin') return 'Quản trị viên';
        if (roleName === 'User') return 'Người dùng';
        return roleName || (userType === 1 ? 'Quản trị viên' : 'Người dùng');
    };

    const getRoleBadgeClass = (userType) => {
        return userType === 1 ? 'badge-danger' : 'badge-info';
    };

    const selectedPermissions = permissionsByUserType[Number(formData.userType)] || [];

    const getUserImageSrc = (user) => {
        const defaultImages = {
            admin2: '/assets/images/admin.jpg',
            customer: '/assets/images/users1.jpg',
            customer4: '/assets/images/users1.jpg',
        };
        const username = String(user.username || '').trim().toLowerCase();
        const image = String(user.image || defaultImages[username] || '').trim();

        if (!image) return '';
        if (/^(https?:)?\/\//i.test(image) || image.startsWith('data:') || image.startsWith('blob:')) return image;
        if (image.startsWith('/')) return image;
        if (image.startsWith('assets/')) return `/${image}`;

        return `/assets/images/${image}`;
    };

    const renderUserAvatar = (user) => {
        const imageSrc = getUserImageSrc(user);
        const initial = String(user.name || user.username || '?').trim().charAt(0).toUpperCase() || '?';
        const fallbackAvatar = (
            <span
                className="bg-primary text-white"
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                }}
            >
                {initial}
            </span>
        );

        if (imageSrc) {
            return (
                <>
                    <img
                        src={imageSrc}
                        alt={user.name || user.username || 'Ảnh đại diện'}
                        style={{
                            width: '40px',
                            height: '40px',
                            objectFit: 'cover',
                            borderRadius: '50%',
                            border: '1px solid #dee2e6',
                        }}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextSibling.style.display = 'inline-flex';
                        }}
                    />
                    <span style={{ display: 'none', width: '40px', height: '40px' }}>
                        {fallbackAvatar}
                    </span>
                </>
            );
        }

        return fallbackAvatar;
    };

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Quản lý người dùng</h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <div className="card-header">
                            <div className="row">
                                <div className="col-md-6">
                                    <form onSubmit={handleSearch} className="form-inline">
                                        <input
                                            type="text"
                                            className="form-control mr-2"
                                            placeholder="Tìm theo tên, email, số điện thoại..."
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                        />
                                        <select
                                            className="form-control mr-2"
                                            value={statusFilter}
                                            onChange={(e) => {
                                                setStatusFilter(e.target.value);
                                                setPage(1);
                                            }}
                                        >
                                            <option value="">Tất cả trạng thái</option>
                                            <option value="true">Đang hoạt động</option>
                                            <option value="false">Ngừng hoạt động</option>
                                        </select>
                                        <button type="submit" className="btn btn-primary">
                                            <i className="fas fa-search"></i> Tìm kiếm
                                        </button>
                                    </form>
                                </div>
                                <div className="col-md-6 text-right">
                                    <button className="btn btn-success" onClick={() => openModal()}>
                                        <i className="fas fa-plus"></i> Thêm người dùng
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary"></div>
                                </div>
                            ) : (
                                <>
                                    <table className="table table-bordered table-striped">
                                        <thead>
                                            <tr>
                                                <th>Ảnh</th>
                                                <th>Tên đăng nhập</th>
                                                <th>Họ tên</th>
                                                <th>Email</th>
                                                <th>Điện thoại</th>
                                                <th>Vai trò</th>
                                                <th>Trạng thái</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="text-center">
                                                        Không tìm thấy người dùng
                                                    </td>
                                                </tr>
                                            ) : (
                                                users.map(user => (
                                                    <tr key={user.id}>
                                                        <td>{renderUserAvatar(user)}</td>
                                                        <td>{user.username}</td>
                                                        <td>{user.name}</td>
                                                        <td>{user.email}</td>
                                                        <td>{user.phone}</td>
                                                        <td>
                                                            <span className={`badge ${getRoleBadgeClass(user.userType)}`}>
                                                                {getRoleName(user.userType)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${user.isActive ? 'badge-success' : 'badge-secondary'}`}>
                                                                {user.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-info mr-1"
                                                                onClick={() => openModal(user)}
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => handleDelete(user.id)}
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>

                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>Tổng: {totalCount} người dùng</span>
                                        <nav>
                                            <ul className="pagination mb-0">
                                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => setPage(page - 1)}>
                                                        Trước
                                                    </button>
                                                </li>
                                                {renderPagination()}
                                                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => setPage(page + 1)}>
                                                        Sau
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal */}
            {showModal && (
                <div className="modal fade show admin-modal" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}
                                </h5>
                                <button type="button" className="close" onClick={closeModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {error && <div className="alert alert-danger">{error}</div>}
                                    <div className="form-group">
                                        <label>Tên đăng nhập</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            required
                                            disabled={!!editingUser}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Mật khẩu {editingUser && '(để trống nếu không đổi)'}</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required={!editingUser}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Họ tên</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Điện thoại</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Chức vụ</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Đường dẫn ảnh</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            placeholder="/assets/images/avatar.jpg"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Vai trò</label>
                                        <select
                                            className="form-control"
                                            value={formData.userType}
                                            onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                                        >
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.userType}>
                                                    {role.name === 'Admin' ? 'Quản trị viên' : role.name === 'User' ? 'Người dùng' : role.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Quyền</label>
                                        <div className="border rounded p-2">
                                            {selectedPermissions.length === 0 ? (
                                                <span className="text-muted">Chưa cấu hình quyền cho vai trò này.</span>
                                            ) : (
                                                selectedPermissions.map((permission) => (
                                                    <span key={permission} className="badge badge-light border mr-1 mb-1">
                                                        {permission}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                    {editingUser && (
                                        <div className="form-group">
                                            <div className="custom-control custom-switch">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id="isActive"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                />
                                                <label className="custom-control-label" htmlFor="isActive">Đang hoạt động</label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingUser ? 'Cập nhật' : 'Tạo mới'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {showModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default Users;

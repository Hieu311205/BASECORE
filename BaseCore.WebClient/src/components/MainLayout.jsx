import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="wrapper">
            {/* Navbar */}
            <nav className="main-header navbar navbar-expand navbar-white navbar-light">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link" data-widget="pushmenu" href="#" role="button">
                            <i className="fas fa-bars"></i>
                        </a>
                    </li>
                    <li className="nav-item d-none d-sm-inline-block">
                        <Link to="/" className="nav-link">Trang chủ</Link>
                    </li>
                </ul>

                <ul className="navbar-nav ml-auto">
                    <li className="nav-item dropdown">
                        <a className="nav-link" data-toggle="dropdown" href="#">
                            <i className="far fa-user"></i> {user?.name || user?.username}
                        </a>
                        <div className="dropdown-menu dropdown-menu-right">
                            <span className="dropdown-item dropdown-header">
                                {user?.email}
                            </span>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item" onClick={handleLogout}>
                                <i className="fas fa-sign-out-alt mr-2"></i> Đăng xuất
                            </button>
                        </div>
                    </li>
                </ul>
            </nav>

            {/* Sidebar */}
            <aside className="main-sidebar sidebar-dark-primary elevation-4">
                <Link to="/" className="brand-link">
                    <span className="brand-text font-weight-light ml-3">
                        <b>Quản lý</b> bán hàng
                    </span>
                </Link>

                <div className="sidebar">
                    <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                        <div className="image">
                            <i className="fas fa-user-circle fa-2x text-light"></i>
                        </div>
                        <div className="info">
                            <Link to="#" className="d-block">{user?.name || user?.username}</Link>
                        </div>
                    </div>

                    <nav className="mt-2">
                        <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
                            <li className="nav-item">
                                <Link to="/" className={`nav-link ${isActive('/')}`}>
                                    <i className="nav-icon fas fa-tachometer-alt"></i>
                                    <p>Tổng quan</p>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/products" className={`nav-link ${isActive('/products')}`}>
                                    <i className="nav-icon fas fa-box"></i>
                                    <p>Sản phẩm</p>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/categories" className={`nav-link ${isActive('/categories')}`}>
                                    <i className="nav-icon fas fa-tags"></i>
                                    <p>Danh mục</p>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/suppliers" className={`nav-link ${isActive('/suppliers')}`}>
                                    <i className="nav-icon fas fa-truck"></i>
                                    <p>Nhà cung cấp</p>
                                </Link>
                            </li>
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link to="/users" className={`nav-link ${isActive('/users')}`}>
                                        <i className="nav-icon fas fa-users"></i>
                                        <p>Người dùng</p>
                                    </Link>
                                </li>
                            )}
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link to="/inventory" className={`nav-link ${isActive('/inventory')}`}>
                                        <i className="nav-icon fas fa-warehouse"></i>
                                        <p>Tồn kho</p>
                                    </Link>
                                </li>
                            )}
                            <li className="nav-item">
                                <Link to="/orders" className={`nav-link ${isActive('/orders')}`}>
                                    <i className="nav-icon fas fa-shopping-cart"></i>
                                    <p>Đơn hàng</p>
                                </Link>
                            </li>
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link to="/payments" className={`nav-link ${isActive('/payments')}`}>
                                        <i className="nav-icon fas fa-credit-card"></i>
                                        <p>Thanh toán</p>
                                    </Link>
                                </li>
                            )}
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link to="/shipping" className={`nav-link ${isActive('/shipping')}`}>
                                        <i className="nav-icon fas fa-shipping-fast"></i>
                                        <p>Vận chuyển</p>
                                    </Link>
                                </li>
                            )}
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link to="/discounts" className={`nav-link ${isActive('/discounts')}`}>
                                        <i className="nav-icon fas fa-percent"></i>
                                        <p>Mã giảm giá</p>
                                    </Link>
                                </li>
                            )}
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link to="/reports" className={`nav-link ${isActive('/reports')}`}>
                                        <i className="nav-icon fas fa-chart-line"></i>
                                        <p>Báo cáo</p>
                                    </Link>
                                </li>
                            )}
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link to="/audit-logs" className={`nav-link ${isActive('/audit-logs')}`}>
                                        <i className="nav-icon fas fa-history"></i>
                                        <p>Nhật ký hệ thống</p>
                                    </Link>
                                </li>
                            )}
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link to="/settings" className={`nav-link ${isActive('/settings')}`}>
                                        <i className="nav-icon fas fa-cog"></i>
                                        <p>Cài đặt</p>
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </nav>
                </div>
            </aside>

            {/* Content */}
            {children}

            {/* Footer */}
            <footer className="main-footer">
                <strong>Bản quyền &copy; 2024 <a href="#">BaseCore Sales</a>.</strong>
                <div className="float-right d-none d-sm-inline-block">
                    <b>Phiên bản</b> 1.0.0
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;

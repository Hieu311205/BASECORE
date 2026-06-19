import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header = () => {
    const { isAuthenticated, user, logout, isAdmin } = useAuth();
    const { totalItems } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path ? 'font-weight-bold text-primary' : '';

    return (
        <header style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
            background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            height: '64px', display: 'flex', alignItems: 'center',
        }}>
            <div className="container d-flex align-items-center justify-content-between">
                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none', color: '#1a1a2e', fontWeight: 700, fontSize: '1.3rem' }}>
                    Lumière
                </Link>

                {/* Nav chính */}
                <ul className="nav mb-0">
                    <li className="nav-item">
                        <Link to="/" className={`nav-link ${isActive('/')}`}>Trang chủ</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/products" className={`nav-link ${isActive('/products')}`}>Sản phẩm</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/about" className={`nav-link ${isActive('/about')}`}>Về chúng tôi</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/contact" className={`nav-link ${isActive('/contact')}`}>Liên hệ</Link>
                    </li>
                </ul>

                {/* Phải: giỏ hàng + auth */}
                <div className="d-flex align-items-center">
                    {/* Giỏ hàng */}
                    <Link to="/cart" style={{ position: 'relative', marginRight: '16px', color: '#333' }}>
                        <i className="fas fa-shopping-cart" style={{ fontSize: '1.2rem' }}></i>
                        {totalItems > 0 && (
                            <span style={{
                                position: 'absolute', top: '-8px', right: '-10px',
                                background: '#e44d26', color: '#fff', borderRadius: '50%',
                                fontSize: '10px', width: '18px', height: '18px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700,
                            }}>
                                {totalItems > 99 ? '99+' : totalItems}
                            </span>
                        )}
                    </Link>

                    {/* Auth */}
                    {isAuthenticated ? (
                        <div className="dropdown">
                            <button
                                className="btn btn-outline-secondary btn-sm dropdown-toggle"
                                data-toggle="dropdown"
                            >
                                <i className="fas fa-user mr-1"></i>
                                {user?.name || user?.username}
                            </button>
                            <div className="dropdown-menu dropdown-menu-right">
                                {isAdmin() && (
                                    <Link to="/admin" className="dropdown-item">
                                        <i className="fas fa-cog mr-2"></i>Quản trị
                                    </Link>
                                )}
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item text-danger" onClick={handleLogout}>
                                    <i className="fas fa-sign-out-alt mr-2"></i>Đăng xuất
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <Link to="/login" className="btn btn-outline-primary btn-sm mr-2">Đăng nhập</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;

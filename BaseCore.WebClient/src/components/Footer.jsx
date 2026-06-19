import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
    <footer style={{ background: '#1a1a2e', color: '#ccc', padding: '40px 0 20px' }}>
        <div className="container">
            <div className="row mb-4">
                <div className="col-md-4 mb-3">
                    <h6 className="text-white font-weight-bold mb-3">Lumière</h6>
                    <p style={{ fontSize: '0.9rem' }}>
                        Mùi hương đẳng cấp từ châu Âu,<br />
                        mang đến trải nghiệm đặc biệt cho bạn.
                    </p>
                </div>
                <div className="col-md-4 mb-3">
                    <h6 className="text-white font-weight-bold mb-3">Liên kết</h6>
                    <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
                        <li><Link to="/" className="text-muted" style={{ textDecoration: 'none' }}>Trang chủ</Link></li>
                        <li><Link to="/products" className="text-muted" style={{ textDecoration: 'none' }}>Sản phẩm</Link></li>
                        <li><Link to="/about" className="text-muted" style={{ textDecoration: 'none' }}>Về chúng tôi</Link></li>
                        <li><Link to="/contact" className="text-muted" style={{ textDecoration: 'none' }}>Liên hệ</Link></li>
                    </ul>
                </div>
                <div className="col-md-4 mb-3">
                    <h6 className="text-white font-weight-bold mb-3">Liên hệ</h6>
                    <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
                        <li><i className="fas fa-map-marker-alt mr-2"></i>123 Đường Hoa Hồng, Q.1, TP.HCM</li>
                        <li><i className="fas fa-phone mr-2"></i>0900 123 456</li>
                        <li><i className="fas fa-envelope mr-2"></i>contact@lumiere.vn</li>
                    </ul>
                </div>
            </div>
            <hr style={{ borderColor: '#333' }} />
            <div className="text-center" style={{ fontSize: '0.85rem' }}>
                &copy; 2024 Lumière. Tất cả quyền được bảo lưu.
            </div>
        </div>
    </footer>
);

export default Footer;

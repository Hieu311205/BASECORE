import React from 'react';

const MainLayout = ({ children }) => {
    return (
        <div className="wrapper">
            {/* Thanh menu AdminLTE phía trên */}
            <nav className="main-header navbar navbar-expand navbar-white navbar-light">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link" data-widget="pushmenu" href="#" role="button"><i className="fas fa-bars"></i></a>
                    </li>
                    <li className="nav-item d-none d-sm-inline-block">
                        <a href="/" className="nav-link">Xem Trang Chủ</a>
                    </li>
                </ul>
            </nav>

            {/* Nội dung trang Admin */}
            <div className="content-wrapper" style={{ padding: '20px' }}>
                {children}
            </div>
        </div>
    );
};

export default MainLayout;
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header-area header-sticky">
      <div className="container">
        <nav className="main-nav">
          <Link to="/" className="logo">
            <img src="/assets/images/logo.png" alt="Lumière" />
          </Link>
          <ul className="nav">
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/products">Sản phẩm</Link></li>
            <li><Link to="/about">Về chúng tôi</Link></li>
            <li><Link to="/contact">Liên hệ</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
export default Header;
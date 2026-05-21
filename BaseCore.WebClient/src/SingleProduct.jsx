import React from 'react';
import Header from './Header';
import Footer from './Footer';

const CustomerLayout = ({ children }) => {
  return (
    <>
      <div className="perfume-topbar">...</div> {/* Copy từ index.html */}
      <Header />
      <div style={{ marginTop: '100px' }}>{children}</div>
      <Footer />
    </>
  );
};
export default CustomerLayout;
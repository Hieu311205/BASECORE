import React from 'react';
import Header from './Header'; 
import Footer from './Footer';

const CustomerLayout = ({ children }) => {
    return (
        <>
            <Header />
            {/* children là nội dung của trang Home hoặc ProductList sẽ hiện ở đây */}
            <main style={{ minHeight: '600px', marginTop: '100px' }}>
                {children}
            </main>
            <Footer />
        </>
    );
};

export default CustomerLayout;
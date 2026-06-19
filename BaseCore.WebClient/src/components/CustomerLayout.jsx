import React from 'react';
import Header from './Header';
import Footer from './Footer';

const CustomerLayout = ({ children }) => (
    <>
        <Header />
        <main style={{ minHeight: '80vh', paddingTop: '64px' }}>
            {children}
        </main>
        <Footer />
    </>
);

export default CustomerLayout;

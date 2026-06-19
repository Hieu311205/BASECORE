import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerLayout from './components/CustomerLayout';
import MainLayout from './components/MainLayout';

// Customer pages
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import SingleProduct from './pages/SingleProduct';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Users from './pages/Users';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Suppliers from './pages/Suppliers';
import Discounts from './pages/Discounts';
import Shipping from './pages/Shipping';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import AuditLogs from './pages/AuditLogs';

const PublicRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Đang tải...</span>
            </div>
        </div>
    );
    if (isAuthenticated) return <Navigate to={isAdmin() ? '/admin' : '/'} replace />;
    return children;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Customer */}
            <Route path="/"           element={<CustomerLayout><Home /></CustomerLayout>} />
            <Route path="/products"   element={<CustomerLayout><ProductPage /></CustomerLayout>} />
            <Route path="/product/:id" element={<CustomerLayout><SingleProduct /></CustomerLayout>} />
            <Route path="/cart"       element={<CustomerLayout><Cart /></CustomerLayout>} />
            <Route path="/about"      element={<CustomerLayout><About /></CustomerLayout>} />
            <Route path="/contact"    element={<CustomerLayout><Contact /></CustomerLayout>} />

            {/* Admin — tất cả dưới /admin */}
            <Route path="/admin"             element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
            <Route path="/admin/products"    element={<ProtectedRoute><MainLayout><Products /></MainLayout></ProtectedRoute>} />
            <Route path="/admin/categories"  element={<ProtectedRoute><MainLayout><Categories /></MainLayout></ProtectedRoute>} />
            <Route path="/admin/suppliers"   element={<ProtectedRoute><MainLayout><Suppliers /></MainLayout></ProtectedRoute>} />
            <Route path="/admin/orders"      element={<ProtectedRoute><MainLayout><Orders /></MainLayout></ProtectedRoute>} />
            <Route path="/admin/users"       element={<ProtectedRoute adminOnly={true}><MainLayout><Users /></MainLayout></ProtectedRoute>} />
            <Route path="/admin/inventory"   element={<ProtectedRoute adminOnly={true}><MainLayout><Inventory /></MainLayout></ProtectedRoute>} />
            <Route path="/admin/reports"     element={<ProtectedRoute adminOnly={true}><MainLayout><Reports /></MainLayout></ProtectedRoute>} />
            <Route path="/admin/discounts"   element={<ProtectedRoute adminOnly={true}><MainLayout><Discounts /></MainLayout></ProtectedRoute>} />
            <Route path="/admin/shipping"    element={<ProtectedRoute adminOnly={true}><MainLayout><Shipping /></MainLayout></ProtectedRoute>} />
            <Route path="/admin/payments"    element={<ProtectedRoute adminOnly={true}><MainLayout><Payments /></MainLayout></ProtectedRoute>} />
            <Route path="/admin/settings"    element={<ProtectedRoute adminOnly={true}><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
            <Route path="/admin/audit-logs"  element={<ProtectedRoute adminOnly={true}><MainLayout><AuditLogs /></MainLayout></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <AppRoutes />
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;

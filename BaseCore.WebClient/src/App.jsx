import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';

// 1. Import các Context và bảo mật
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Sửa lại các dòng này ở đầu file App.jsx
import Home from './pages/Home'; // Nếu Home.jsx nằm ngay trong pages
import CustomerLayout from './components/CustomerLayout'; // Nếu file nằm ngay trong components
import MainLayout from './components/MainLayout';

// 4. Import các trang giao diện Admin (Đảm bảo file đã tồn tại trong src/pages)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products'; // Đây là trang quản lý sản phẩm của Admin
import Categories from './pages/Categories';
import Users from './pages/Users';
import Orders from './pages/Orders';

// Component phụ để chặn user đã login vào lại trang login
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div className="spinner-border text-primary"></div>;
    if (isAuthenticated) return <Navigate to="/" replace />;
    return children;
};


function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/products"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <Products />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/categories"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <Categories />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/users"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <MainLayout>
                            <Users />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/orders"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <Orders />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            {/* Trang dành cho khách hàng */}
  <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
  <Route path="/products" element={<CustomerLayout><ProductPage /></CustomerLayout>} />
  <Route path="/product/:id" element={<CustomerLayout><SingleProduct /></CustomerLayout>} />
  
  {/* Giữ nguyên các trang Admin cũ của bạn bên dưới */}
  <Route path="/admin/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
            <AuthProvider>
                <Routes>
                    {/* Giao diện Người dùng cuối (Nước hoa) */}
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    
                    {/* Giao diện Admin (Giữ nguyên các route cũ của bạn) */}
                    <Route path="/login" element={<Login />} />
                    {/* ... các route admin khác */}
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;

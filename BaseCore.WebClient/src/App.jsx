import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Suppliers from './pages/Suppliers'; // ✅ THÊM DÒNG NÀY
import Discounts from './pages/Discounts';
import Shipping from './pages/Shipping';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import AuditLogs from './pages/AuditLogs';

// Wrapper to redirect authenticated users away from login
const PublicRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (isAuthenticated && isAdmin()) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function AppRoutes() {
    return (
        <Routes>
            {/* LOGIN */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />

            {/* DASHBOARD */}
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

            {/* PRODUCTS */}
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

            {/* CATEGORIES */}
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

            {/* SUPPLIERS ✅ FIX Ở ĐÂY */}
            <Route
                path="/suppliers"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <Suppliers />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* USERS */}
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

            {/* INVENTORY */}
            <Route
                path="/inventory"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <MainLayout>
                            <Inventory />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* REPORTS */}
            <Route
                path="/reports"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <MainLayout>
                            <Reports />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* DISCOUNTS */}
            <Route
                path="/discounts"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <MainLayout>
                            <Discounts />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* SHIPPING */}
            <Route
                path="/shipping"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <MainLayout>
                            <Shipping />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* PAYMENTS */}
            <Route
                path="/payments"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <MainLayout>
                            <Payments />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* ORDERS */}
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

            {/* SETTINGS */}
            <Route
                path="/settings"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <MainLayout>
                            <Settings />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* AUDIT LOGS */}
            <Route
                path="/audit-logs"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <MainLayout>
                            <AuditLogs />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* DEFAULT */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;

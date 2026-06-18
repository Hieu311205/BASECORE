import React, { useState, useEffect } from 'react';
import { productApi, userApi, categoryApi, orderApi, suppliersApi, promotionsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        users: 0,
        orders: 0,
        suppliers: 0,
        promotions: 0,
        payments: 0,
        inventory: 0,
    });

    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAuth();

    useEffect(() => {
        loadStats();
    }, []);

    const getCount = (data) => {
        return data?.totalCount || data?.items?.length || data?.data?.length || data?.length || 0;
    };

    const loadStats = async () => {
        try {
            const [productsRes, categoriesRes, ordersRes, suppliersRes, promotionsRes] = await Promise.all([
                productApi.getAll(),
                categoryApi.getAll(),
                orderApi.getAll(),
                suppliersApi.getAll(),
                promotionsApi.getAll(), 
            ]);

            let usersCount = 0;

            if (isAdmin()) {
                try {
                    const usersRes = await userApi.getAll({ page: 1, pageSize: 1 });
                    usersCount = getCount(usersRes.data);
                } catch (e) {
                    console.log('Không thể tải số lượng người dùng');
                }
            }

            setStats({
                products: getCount(productsRes.data),
                categories: getCount(categoriesRes.data),
                users: usersCount,
                orders: getCount(ordersRes.data),
                suppliers: getCount(suppliersRes.data),
                promotions: getCount(promotionsRes.data),
                payments: getCount(ordersRes.data),
                inventory: getCount(productsRes.data),
            });
        } catch (error) {
            console.error('Không thể tải thống kê:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Tổng quan</h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Đang tải...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="row">
                            <div className="col-lg-3 col-6">
                                <div className="small-box bg-info">
                                    <div className="inner">
                                        <h3>{stats.products}</h3>
                                        <p>Sản phẩm</p>
                                    </div>
                                    <div className="icon">
                                        <i className="fas fa-box"></i>
                                    </div>
                                    <a href="/products" className="small-box-footer">
                                        Xem chi tiết <i className="fas fa-arrow-circle-right"></i>
                                    </a>
                                </div>
                            </div>

                            <div className="col-lg-3 col-6">
                                <div className="small-box bg-success">
                                    <div className="inner">
                                        <h3>{stats.categories}</h3>
                                        <p>Danh mục</p>
                                    </div>
                                    <div className="icon">
                                        <i className="fas fa-tags"></i>
                                    </div>
                                    <a href="/categories" className="small-box-footer">
                                        Xem chi tiết <i className="fas fa-arrow-circle-right"></i>
                                    </a>
                                </div>
                            </div>

                            <div className="col-lg-3 col-6">
                                <div className="small-box bg-primary">
                                    <div className="inner">
                                        <h3>{stats.suppliers}</h3>
                                        <p>Nhà cung cấp</p>
                                    </div>
                                    <div className="icon">
                                        <i className="fas fa-truck"></i>
                                    </div>
                                    <a href="/suppliers" className="small-box-footer">
                                        Xem chi tiết <i className="fas fa-arrow-circle-right"></i>
                                    </a>
                                </div>
                            </div>

                            <div className="col-lg-3 col-6">
                                <div className="small-box bg-danger">
                                    <div className="inner">
                                        <h3>{stats.orders}</h3>
                                        <p>Đơn hàng</p>
                                    </div>
                                    <div className="icon">
                                        <i className="fas fa-shopping-bag"></i>
                                    </div>
                                    <a href="/orders" className="small-box-footer">
                                        Xem chi tiết <i className="fas fa-arrow-circle-right"></i>
                                    </a>
                                </div>
                            </div>

                            {isAdmin() && (
                                <div className="col-lg-3 col-6">
                                    <div className="small-box bg-warning">
                                        <div className="inner">
                                            <h3>{stats.users}</h3>
                                            <p>Người dùng</p>
                                        </div>
                                        <div className="icon">
                                            <i className="fas fa-users"></i>
                                        </div>
                                        <a href="/users" className="small-box-footer">
                                            Xem chi tiết <i className="fas fa-arrow-circle-right"></i>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {isAdmin() && (
                                <div className="col-lg-3 col-6">
                                    <div className="small-box bg-purple">
                                        <div className="inner">
                                            <h3>{stats.promotions}</h3>
                                            <p>Mã giảm giá</p>
                                        </div>
                                        <div className="icon">
                                            <i className="fas fa-percent"></i>
                                        </div>
                                        <a href="/discounts" className="small-box-footer">
                                            Xem chi tiết <i className="fas fa-arrow-circle-right"></i>
                                        </a>
                                    </div>
                                </div>
                            )}
                             <div className="col-lg-3 col-6">
                                <div className="small-box bg-indigo">
                                    <div className="inner">
                                        <h3>{stats.payments}</h3>
                                        <p>Thanh toán</p>
                                    </div>
                                    <div className="icon">
                                        <i className="fas fa-money-bill"></i>
                                    </div>
                                    <a href="/payments" className="small-box-footer">
                                        Xem chi tiết <i className="fas fa-arrow-circle-right"></i>
                                    </a>
                                </div>
                            </div>
                            <div className="col-lg-3 col-6">
                                <div className="small-box bg-teal">
                                    <div className="inner">
                                        <h3>{stats.inventory}</h3>
                                        <p>Tồn kho</p>
                                    </div>
                                    <div className="icon">
                                        <i className="fas fa-tags"></i>
                                    </div>
                                    <a href="/inventory" className="small-box-footer">
                                        Xem chi tiết <i className="fas fa-arrow-circle-right"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Chào mừng đến hệ thống bán hàng BaseCore</h3>
                                </div>
                                <div className="card-body">
                                    <p>Đây là hệ thống mẫu dùng cho phát triển web với:</p>
                                    <ul>
                                        <li><strong>Backend:</strong> .NET Core 8.0 với Entity Framework Core</li>
                                        <li><strong>Frontend:</strong> React 18 với React Router</li>
                                        <li><strong>Giao diện:</strong> AdminLTE 3 với Bootstrap 4</li>
                                        <li><strong>Xác thực:</strong> JWT Bearer Token</li>
                                    </ul>

                                    <p>Chức năng gồm:</p>
                                    <ul>
                                        <li>Xác thực người dùng (đăng nhập/đăng xuất)</li>
                                        <li>Quản lý sản phẩm (thêm, sửa, xóa, tìm kiếm và phân trang)</li>
                                        <li>Quản lý danh mục</li>
                                        <li>Quản lý nhà cung cấp</li>
                                        <li>Quản lý người dùng (chỉ admin)</li>
                                        <li>Quản lý tồn kho</li>
                                        <li>Quản lý đơn hàng</li>
                                        <li>Quản lý thanh toán</li>
                                        <li>Cài đặt vận chuyển</li>
                                        <li>Quản lý mã giảm giá (chỉ admin)</li>
                                        <li>Cài đặt hệ thống</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;

import React, { useEffect, useMemo, useState } from 'react';
import { categoryApi, orderApi, productApi, suppliersApi, userApi } from '../services/api';

const orderStatusLabels = {
    Pending: 'Chờ xử lý',
    Confirmed: 'Đã xác nhận',
    Shipping: 'Đang giao',
    Completed: 'Hoàn tất',
    Cancelled: 'Đã hủy',
    Unknown: 'Không xác định',
};

const paymentStatusLabels = {
    Unpaid: 'Chưa thanh toán',
    Paid: 'Đã thanh toán',
    Refunded: 'Đã hoàn tiền',
};

const pad = (value) => String(value).padStart(2, '0');

const toDateInputValue = (date) => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const toMonthInputValue = (date) => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
};

const getStartOfWeek = (date) => {
    const value = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = value.getDay() || 7;
    value.setDate(value.getDate() - day + 1);
    return value;
};

const buildDateSeries = (startDate, days) => {
    return Array.from({ length: days }, (_, index) => {
        const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + index);
        return toDateInputValue(date);
    });
};

const parseDateInput = (value) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const parseMonthInput = (value) => {
    const [year, month] = value.split('-').map(Number);
    return { year, month };
};

const Reports = () => {
    const today = new Date();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [counts, setCounts] = useState({
        categories: 0,
        suppliers: 0,
        users: 0,
    });
    const [chartMode, setChartMode] = useState('week');
    const [selectedDate, setSelectedDate] = useState(toDateInputValue(today));
    const [selectedMonth, setSelectedMonth] = useState(toMonthInputValue(today));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadReports();
    }, []);

    const getItems = (data) => data?.items || data?.data || data || [];
    const getCount = (data) => data?.totalCount || data?.items?.length || data?.data?.length || data?.length || 0;

    const loadReports = async () => {
        setLoading(true);
        setError('');

        try {
            const [ordersRes, productsRes, categoriesRes, suppliersRes] = await Promise.all([
                orderApi.getAll({ page: 1, pageSize: 1000 }),
                productApi.getAll({ page: 1, pageSize: 1000 }),
                categoryApi.getAll({ page: 1, pageSize: 1000 }),
                suppliersApi.getAll({ page: 1, pageSize: 1000 }),
            ]);

            let usersCount = 0;
            try {
                const usersRes = await userApi.getAll({ page: 1, pageSize: 1 });
                usersCount = getCount(usersRes.data);
            } catch {
                usersCount = 0;
            }

            setOrders(getItems(ordersRes.data));
            setProducts(getItems(productsRes.data));
            setCounts({
                categories: getCount(categoriesRes.data),
                suppliers: getCount(suppliersRes.data),
                users: usersCount,
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải báo cáo');
        } finally {
            setLoading(false);
        }
    };

    const report = useMemo(() => {
        const statusCounts = {};
        const statusRevenue = {};
        const paymentCounts = {};
        const revenueByDate = {};
        const safeSelectedDate = selectedDate || toDateInputValue(new Date());
        const safeSelectedMonth = selectedMonth || toMonthInputValue(new Date());
        const selectedDates = chartMode === 'week'
            ? buildDateSeries(getStartOfWeek(parseDateInput(safeSelectedDate)), 7)
            : (() => {
                const { year, month } = parseMonthInput(safeSelectedMonth);
                const daysInMonth = new Date(year, month, 0).getDate();
                return buildDateSeries(new Date(year, month - 1, 1), daysInMonth);
            })();
        const selectedDateSet = new Set(selectedDates);
        let totalRevenue = 0;
        let completedRevenue = 0;
        let paidRevenue = 0;
        let selectedPeriodRevenue = 0;
        let selectedPeriodOrders = 0;

        orders.forEach((order) => {
            const amount = Number(order.totalAmount || 0);
            const status = order.status || 'Unknown';
            const paymentStatus = order.paymentStatus || 'Unpaid';
            const orderDate = order.orderDate ? new Date(order.orderDate) : null;
            const dateKey = orderDate && !Number.isNaN(orderDate.getTime())
                ? toDateInputValue(orderDate)
                : 'Unknown';

            totalRevenue += amount;
            if (status === 'Completed') completedRevenue += amount;
            if (paymentStatus === 'Paid') paidRevenue += amount;

            statusCounts[status] = (statusCounts[status] || 0) + 1;
            statusRevenue[status] = (statusRevenue[status] || 0) + amount;
            paymentCounts[paymentStatus] = (paymentCounts[paymentStatus] || 0) + 1;
            revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + amount;

            if (selectedDateSet.has(dateKey)) {
                selectedPeriodRevenue += amount;
                selectedPeriodOrders += 1;
            }
        });

        const lowStockProducts = products.filter((product) => Number(product.stock || 0) <= 10);
        const inactiveProducts = products.filter((product) => product.isActive === false);
        const revenueSeries = selectedDates.map((date) => ({
            date,
            revenue: revenueByDate[date] || 0,
        }));
        const maxDailyRevenue = Math.max(...revenueSeries.map((item) => item.revenue), 1);
        const maxStatusRevenue = Math.max(...Object.values(statusRevenue), 1);
        const selectedPeriodLabel = chartMode === 'week'
            ? `${selectedDates[0].slice(5)} to ${selectedDates[selectedDates.length - 1].slice(5)}`
            : safeSelectedMonth;

        return {
            totalRevenue,
            completedRevenue,
            paidRevenue,
            selectedPeriodRevenue,
            selectedPeriodOrders,
            selectedPeriodLabel,
            statusCounts,
            statusRevenue,
            paymentCounts,
            revenueSeries,
            maxDailyRevenue,
            maxStatusRevenue,
            lowStockProducts,
            inactiveProducts,
        };
    }, [orders, products, chartMode, selectedDate, selectedMonth]);

    const formatMoney = (value) => `${Number(value || 0).toLocaleString()} VND`;

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Báo cáo</h1>
                        </div>
                        <div className="col-sm-6 text-right">
                            <button className="btn btn-primary" onClick={loadReports} disabled={loading}>
                                <i className="fas fa-sync-alt"></i> Tải lại
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {error && <div className="alert alert-danger">{error}</div>}

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary"></div>
                        </div>
                    ) : (
                        <>
                            <div className="row">
                                <div className="col-12">
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="row align-items-end">
                                                <div className="col-md-3">
                                                    <label>Loại biểu đồ</label>
                                                    <select
                                                        className="form-control"
                                                        value={chartMode}
                                                        onChange={(event) => setChartMode(event.target.value)}
                                                    >
                                                        <option value="week">Theo tuần</option>
                                                        <option value="month">Theo tháng</option>
                                                    </select>
                                                </div>
                                                {chartMode === 'week' ? (
                                                    <div className="col-md-3">
                                                        <label>Chọn ngày</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={selectedDate}
                                                            onChange={(event) => setSelectedDate(event.target.value)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="col-md-3">
                                                        <label>Chọn tháng</label>
                                                        <input
                                                            type="month"
                                                            className="form-control"
                                                            value={selectedMonth}
                                                            onChange={(event) => setSelectedMonth(event.target.value)}
                                                        />
                                                    </div>
                                                )}
                                                <div className="col-md-3">
                                                    <label>Kỳ đang xem</label>
                                                    <div className="form-control bg-light">{report.selectedPeriodLabel}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-4 col-6">
                                    <div className="small-box bg-success">
                                        <div className="inner">
                                            <h3>{formatMoney(report.selectedPeriodRevenue)}</h3>
                                            <p>{chartMode === 'week' ? 'Doanh thu theo tuần' : 'Doanh thu theo tháng'}</p>
                                        </div>
                                        <div className="icon"><i className="fas fa-money-bill-wave"></i></div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-6">
                                    <div className="small-box bg-info">
                                        <div className="inner">
                                            <h3>{report.selectedPeriodOrders}</h3>
                                            <p>{chartMode === 'week' ? 'Đơn hàng theo tuần' : 'Đơn hàng theo tháng'}</p>
                                        </div>
                                        <div className="icon"><i className="fas fa-shopping-cart"></i></div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-6">
                                    <div className="small-box bg-warning">
                                        <div className="inner">
                                            <h3>{report.lowStockProducts.length}</h3>
                                            <p>Sản phẩm sắp hết hàng</p>
                                        </div>
                                        <div className="icon"><i className="fas fa-exclamation-triangle"></i></div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-8">
                                    <div className="card">
                                        <div className="card-header">
                                            <h3 className="card-title">
                                                Doanh thu theo {chartMode === 'week' ? 'tuần' : 'tháng'}
                                            </h3>
                                        </div>
                                        <div className="card-body">
                                            {report.revenueSeries.length === 0 ? (
                                                <div className="text-center text-muted py-4">Không có dữ liệu doanh thu</div>
                                            ) : (
                                                <div
                                                    className="d-flex align-items-end"
                                                    style={{
                                                        height: '260px',
                                                        gap: chartMode === 'week' ? '10px' : '4px',
                                                        borderLeft: '1px solid #dee2e6',
                                                        borderBottom: '1px solid #dee2e6',
                                                        padding: '12px 8px 0 12px',
                                                    }}
                                                >
                                                    {report.revenueSeries.map((item) => {
                                                        const height = Math.max((item.revenue / report.maxDailyRevenue) * 220, 8);
                                                        return (
                                                            <div
                                                                key={item.date}
                                                                className="d-flex flex-column align-items-center flex-fill"
                                                                style={{ minWidth: 0 }}
                                                            >
                                                                <div className="small text-muted mb-1">
                                                                    {Math.round(item.revenue / 1000).toLocaleString()}k
                                                                </div>
                                                                <div
                                                                    title={`${item.date}: ${formatMoney(item.revenue)}`}
                                                                    style={{
                                                                        width: '100%',
                                                                        maxWidth: '42px',
                                                                        height: `${height}px`,
                                                                        background: '#28a745',
                                                                        borderRadius: '4px 4px 0 0',
                                                                    }}
                                                                />
                                                                <div className="small text-muted mt-2 text-center" style={{ fontSize: '11px' }}>
                                                                    {chartMode === 'week' ? item.date.slice(5) : item.date.slice(8)}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="card">
                                        <div className="card-header">
                                            <h3 className="card-title">Doanh thu theo trạng thái đơn</h3>
                                        </div>
                                        <div className="card-body">
                                            {Object.entries(report.statusRevenue).length === 0 ? (
                                                <div className="text-center text-muted py-4">Không có dữ liệu doanh thu theo trạng thái</div>
                                            ) : (
                                                Object.entries(report.statusRevenue).map(([status, revenue]) => (
                                                    <div key={status} className="mb-3">
                                                        <div className="d-flex justify-content-between">
                                                            <span>{orderStatusLabels[status] || status}</span>
                                                            <strong>{formatMoney(revenue)}</strong>
                                                        </div>
                                                        <div className="progress" style={{ height: '12px' }}>
                                                            <div
                                                                className="progress-bar bg-info"
                                                                style={{ width: `${Math.max((revenue / report.maxStatusRevenue) * 100, 4)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card">
                                        <div className="card-header">
                                            <h3 className="card-title">Tóm tắt bán hàng</h3>
                                        </div>
                                        <div className="card-body">
                                            <table className="table table-bordered">
                                                <tbody>
                                                    <tr><th>Tổng doanh thu</th><td>{formatMoney(report.totalRevenue)}</td></tr>
                                                    <tr><th>Doanh thu hoàn tất</th><td>{formatMoney(report.completedRevenue)}</td></tr>
                                                    <tr><th>Doanh thu đã thanh toán</th><td>{formatMoney(report.paidRevenue)}</td></tr>
                                                    <tr><th>Sản phẩm</th><td>{products.length}</td></tr>
                                                    <tr><th>Danh mục</th><td>{counts.categories}</td></tr>
                                                    <tr><th>Nhà cung cấp</th><td>{counts.suppliers}</td></tr>
                                                    <tr><th>Người dùng</th><td>{counts.users}</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="card">
                                        <div className="card-header">
                                            <h3 className="card-title">Trạng thái đơn hàng</h3>
                                        </div>
                                        <div className="card-body">
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>Trạng thái</th>
                                                        <th>Số lượng</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(report.statusCounts).map(([status, count]) => (
                                                        <tr key={status}>
                                                            <td>{orderStatusLabels[status] || status}</td>
                                                            <td>{count}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card">
                                        <div className="card-header">
                                            <h3 className="card-title">Trạng thái thanh toán</h3>
                                        </div>
                                        <div className="card-body">
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>Trạng thái</th>
                                                        <th>Số lượng</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(report.paymentCounts).map(([status, count]) => (
                                                        <tr key={status}>
                                                            <td>{paymentStatusLabels[status] || status}</td>
                                                            <td>{count}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="card">
                                        <div className="card-header">
                                            <h3 className="card-title">Sản phẩm sắp hết hàng</h3>
                                        </div>
                                        <div className="card-body">
                                            <table className="table table-bordered table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>Sản phẩm</th>
                                                        <th>SKU</th>
                                                        <th>Tồn kho</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {report.lowStockProducts.length === 0 ? (
                                                        <tr><td colSpan="3" className="text-center">Không có sản phẩm sắp hết hàng</td></tr>
                                                    ) : (
                                                        report.lowStockProducts.slice(0, 10).map((product) => (
                                                            <tr key={product.id}>
                                                                <td>{product.name}</td>
                                                                <td>{product.sku || 'Không có'}</td>
                                                                <td>{product.stock}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Reports;

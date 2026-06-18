import React, { useEffect, useMemo, useState } from 'react';
import { orderApi } from '../services/api';

const orderStatusLabels = {
    Pending: 'Chờ xử lý',
    Confirmed: 'Đã xác nhận',
    Shipping: 'Đang giao',
    Completed: 'Hoàn tất',
    Cancelled: 'Đã hủy',
};

const paymentStatusLabels = {
    Unpaid: 'Chưa thanh toán',
    Paid: 'Đã thanh toán',
    Refunded: 'Đã hoàn tiền',
};

const Payments = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState('');
    const [updatingPaymentId, setUpdatingPaymentId] = useState(null);

    useEffect(() => {
        loadPayments();
    }, [page, statusFilter]);

    const loadPayments = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await orderApi.getAll({
                keyword: keyword.trim() || undefined,
                paymentStatus: statusFilter || undefined,
                page,
                pageSize,
            });
            setOrders(response.data?.items || []);
            setTotalPages(response.data?.totalPages || 0);
            setTotalCount(response.data?.totalCount || 0);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải thanh toán');
            setOrders([]);
            setTotalPages(0);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        return orders.reduce(
            (result, order) => {
                const amount = Number(order.totalAmount || 0);
                const paymentStatus = order.paymentStatus || 'Unpaid';
                result.total += amount;
                result[paymentStatus] = (result[paymentStatus] || 0) + amount;
                return result;
            },
            { total: 0, Paid: 0, Unpaid: 0, Refunded: 0 }
        );
    }, [orders]);

    const updatePaymentStatus = async (order, paymentStatus) => {
        if ((order.paymentStatus || 'Unpaid') === paymentStatus) return;

        setUpdatingPaymentId(order.id);
        setError('');

        try {
            await orderApi.update(order.id, {
                status: order.status,
                paymentStatus,
            });

            setOrders((currentOrders) => {
                const updatedOrders = currentOrders.map((item) =>
                    item.id === order.id ? { ...item, paymentStatus } : item
                );

                if (statusFilter && statusFilter !== paymentStatus) {
                    return updatedOrders.filter((item) => item.id !== order.id);
                }

                return updatedOrders;
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể cập nhật trạng thái thanh toán');
        } finally {
            setUpdatingPaymentId(null);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (page === 1) {
            loadPayments();
        } else {
            setPage(1);
        }
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i)}>{i}</button>
                </li>
            );
        }
        return pages;
    };

    const renderPaymentActions = (order) => {
        const currentStatus = order.paymentStatus || 'Unpaid';
        const isUpdating = updatingPaymentId === order.id;
        const actions = [
            { status: 'Paid', label: 'Đã thanh toán', icon: 'fas fa-check', className: 'btn-outline-success' },
            { status: 'Refunded', label: 'Hoàn tiền', icon: 'fas fa-undo', className: 'btn-outline-warning' },
            { status: 'Unpaid', label: 'Chưa thanh toán', icon: 'far fa-clock', className: 'btn-outline-secondary' },
        ];

        return (
            <div className="btn-group btn-group-sm" role="group" aria-label="Cập nhật thanh toán">
                {actions.map((action) => (
                    <button
                        key={action.status}
                        type="button"
                        className={`btn ${action.className} ${currentStatus === action.status ? 'active' : ''}`}
                        onClick={() => updatePaymentStatus(order, action.status)}
                        disabled={isUpdating || currentStatus === action.status}
                        title={action.label}
                        aria-label={action.label}
                    >
                        <i className={isUpdating ? 'fas fa-spinner fa-spin' : action.icon}></i>
                    </button>
                ))}
            </div>
        );
    };

    const getPaymentBadgeClass = (paymentStatus) => {
        if (paymentStatus === 'Paid') return 'badge-success';
        if (paymentStatus === 'Refunded') return 'badge-warning';
        return 'badge-secondary';
    };

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Thanh toán</h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-4 col-6">
                            <div className="small-box bg-success">
                                <div className="inner">
                                    <h3>{stats.Paid.toLocaleString()} VND</h3>
                                    <p>Đã thanh toán</p>
                                </div>
                                <div className="icon"><i className="fas fa-check-circle"></i></div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-6">
                            <div className="small-box bg-secondary">
                                <div className="inner">
                                    <h3>{stats.Unpaid.toLocaleString()} VND</h3>
                                    <p>Chưa thanh toán</p>
                                </div>
                                <div className="icon"><i className="fas fa-clock"></i></div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>{stats.Refunded.toLocaleString()} VND</h3>
                                    <p>Đã hoàn tiền</p>
                                </div>
                                <div className="icon"><i className="fas fa-undo"></i></div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <form className="form-inline" onSubmit={handleSearch}>
                                <input
                                    type="text"
                                    className="form-control mr-2"
                                    placeholder="Tìm đơn hàng, người dùng, người nhận..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                                <select
                                    className="form-control mr-2"
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setPage(1);
                                    }}
                                >
                                    <option value="">Tất cả thanh toán</option>
                                    <option value="Unpaid">Chưa thanh toán</option>
                                    <option value="Paid">Đã thanh toán</option>
                                    <option value="Refunded">Đã hoàn tiền</option>
                                </select>
                                <button type="submit" className="btn btn-primary mr-2">
                                    <i className="fas fa-search"></i> Tìm kiếm
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={loadPayments}>
                                    <i className="fas fa-sync-alt"></i> Tải lại
                                </button>
                            </form>
                        </div>

                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary"></div>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-bordered table-striped">
                                        <thead>
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Khách hàng</th>
                                                <th>Phương thức</th>
                                                <th>Số tiền</th>
                                                <th>Trạng thái thanh toán</th>
                                                <th>Trạng thái đơn</th>
                                                <th style={{ width: '132px' }}>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center">Không tìm thấy thanh toán</td>
                                                </tr>
                                            ) : (
                                                orders.map((order) => (
                                                    <tr key={order.id}>
                                                        <td>{order.id}</td>
                                                        <td>{order.recipientName || `User #${order.userId}`}</td>
                                                        <td>{order.paymentMethod || 'COD'}</td>
                                                        <td>{Number(order.totalAmount || 0).toLocaleString()} VND</td>
                                                        <td>
                                                            <span className={`badge ${getPaymentBadgeClass(order.paymentStatus || 'Unpaid')}`}>
                                                                {paymentStatusLabels[order.paymentStatus || 'Unpaid'] || order.paymentStatus || 'Chưa thanh toán'}
                                                            </span>
                                                        </td>
                                                        <td>{orderStatusLabels[order.status] || order.status}</td>
                                                        <td>{renderPaymentActions(order)}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>Hiển thị: {orders.length} / {totalCount} thanh toán</span>
                                        <nav>
                                            <ul className="pagination mb-0">
                                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                                    <button className="page-link" disabled={page === 1} onClick={() => setPage(page - 1)}>
                                                        Trước
                                                    </button>
                                                </li>
                                                {renderPagination()}
                                                <li className={`page-item ${page === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                                                    <button className="page-link" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)}>
                                                        Sau
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Payments;

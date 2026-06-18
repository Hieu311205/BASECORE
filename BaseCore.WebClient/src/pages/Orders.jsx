// import React, { useState, useEffect } from 'react';
// import { orderApi } from '../services/api';
// import { useAuth } from '../contexts/AuthContext';

// const Orders = () => {
//     const [orders, setOrders] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showModal, setShowModal] = useState(false);
//     const [editingOrder, setEditingOrder] = useState(null);
//     const [formData, setFormData] = useState({
//         userId: '',
//         orderDate: '',
//         totalAmount: '',
//         status: '',
//         shippingAddress: '',
//     });
//     const [error, setError] = useState('');
//     const { isAdmin } = useAuth();

//     useEffect(() => {
//         loadOrders();
//     }, []);

//     const loadOrders = async () => {
//         setLoading(true);
//         try {
//             const response = await orderApi.getAll();
//             setOrders(response.data || []);
//         } catch (error) {
//             console.error('Failed to load orders:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const openModal = (order = null) => {
//         if (order) {
//             setEditingOrder(order);
//             setFormData({
//                 userId: order.userId || '',
//                 orderDate: order.orderDate ? order.orderDate.substring(0, 16) : '',
//                 totalAmount: order.totalAmount || '',
//                 status: order.status || '',
//                 shippingAddress: order.shippingAddress || '',
//             });
//         } else {
//             setEditingOrder(null);
//             setFormData({
//                 userId: '',
//                 orderDate: '',
//                 totalAmount: '',
//                 status: '',
//                 shippingAddress: '',
//             });
//         }
//         setError('');
//         setShowModal(true);
//     };

//     const closeModal = () => {
//         setShowModal(false);
//         setEditingOrder(null);
//         setError('');
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');

//         try {
//             const payload = {
//                 userId: Number(formData.userId),
//                 orderDate: formData.orderDate,
//                 totalAmount: Number(formData.totalAmount),
//                 status: formData.status,
//                 shippingAddress: formData.shippingAddress,
//             };

//             if (editingOrder) {
//                 await orderApi.update(editingOrder.id, {
//                     id: editingOrder.id,
//                     ...payload,
//                 });
//             } else {
//                 await orderApi.create(payload);
//             }

//             closeModal();
//             loadOrders();
//         } catch (error) {
//             setError(error.response?.data?.message || 'Operation failed');
//         }
//     };

//     const handleDelete = async (id) => {
//         if (!window.confirm('Are you sure you want to delete this order?')) return;

//         try {
//             await orderApi.delete(id);
//             loadOrders();
//         } catch (error) {
//             alert('Failed to delete order.');
//         }
//     };

//     return (
//         <div className="content-wrapper">
//             <div className="content-header">
//                 <div className="container-fluid">
//                     <div className="row mb-2">
//                         <div className="col-sm-6">
//                             <h1 className="m-0">Orders Management</h1>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <section className="content">
//                 <div className="container-fluid">
//                     <div className="card">
//                         <div className="card-header">
//                             <div className="row">
//                                 <div className="col-md-6">
//                                     <h3 className="card-title">All Orders</h3>
//                                 </div>
//                                 <div className="col-md-6 text-right">
//                                     {isAdmin() && (
//                                         <button className="btn btn-success" onClick={() => openModal()}>
//                                             <i className="fas fa-plus"></i> Add Order
//                                         </button>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="card-body">
//                             {loading ? (
//                                 <div className="text-center py-5">
//                                     <div className="spinner-border text-primary"></div>
//                                 </div>
//                             ) : (
//                                 <table className="table table-bordered table-striped">
//                                     <thead>
//                                         <tr>
//                                             <th>ID</th>
//                                             <th>UserId</th>
//                                             <th>OrderDate</th>
//                                             <th>TotalAmount</th>
//                                             <th>Status</th>
//                                             <th>ShippingAddress</th>
//                                             {isAdmin() && <th>Actions</th>}
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {orders.length === 0 ? (
//                                             <tr>
//                                                 <td colSpan={isAdmin() ? 7 : 6} className="text-center">
//                                                     No orders found
//                                                 </td>
//                                             </tr>
//                                         ) : (
//                                             orders.map(order => (
//                                                 <tr key={order.id}>
//                                                     <td>{order.id}</td>
//                                                     <td>{order.userId}</td>
//                                                     <td>{order.orderDate}</td>
//                                                     <td>{order.totalAmount}</td>
//                                                     <td>{order.status}</td>
//                                                     <td>{order.shippingAddress}</td>
//                                                     {isAdmin() && (
//                                                         <td>
//                                                             <button
//                                                                 className="btn btn-sm btn-info mr-1"
//                                                                 onClick={() => openModal(order)}
//                                                             >
//                                                                 <i className="fas fa-edit"></i>
//                                                             </button>
//                                                             <button
//                                                                 className="btn btn-sm btn-danger"
//                                                                 onClick={() => handleDelete(order.id)}
//                                                             >
//                                                                 <i className="fas fa-trash"></i>
//                                                             </button>
//                                                         </td>
//                                                     )}
//                                                 </tr>
//                                             ))
//                                         )}
//                                     </tbody>
//                                 </table>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* Modal */}
//             {showModal && (
//                 <div className="modal fade show" style={{ display: 'block' }}>
//                     <div className="modal-dialog">
//                         <div className="modal-content">
//                             <div className="modal-header">
//                                 <h5 className="modal-title">
//                                     {editingOrder ? 'Edit Order' : 'Add Order'}
//                                 </h5>
//                                 <button className="close" onClick={closeModal}>
//                                     <span>&times;</span>
//                                 </button>
//                             </div>

//                             <form onSubmit={handleSubmit}>
//                                 <div className="modal-body">
//                                     {error && <div className="alert alert-danger">{error}</div>}

//                                     <div className="form-group">
//                                         <label>UserId</label>
//                                         <input
//                                             type="number"
//                                             className="form-control"
//                                             value={formData.userId}
//                                             onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
//                                             required
//                                         />
//                                     </div>

//                                     <div className="form-group">
//                                         <label>OrderDate</label>
//                                         <input
//                                             type="datetime-local"
//                                             className="form-control"
//                                             value={formData.orderDate}
//                                             onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
//                                             required
//                                         />
//                                     </div>

//                                     <div className="form-group">
//                                         <label>TotalAmount</label>
//                                         <input
//                                             type="number"
//                                             className="form-control"
//                                             value={formData.totalAmount}
//                                             onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
//                                             required
//                                         />
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Status</label>
//                                         <input
//                                             type="text"
//                                             className="form-control"
//                                             value={formData.status}
//                                             onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                                             required
//                                         />
//                                     </div>

//                                     <div className="form-group">
//                                         <label>ShippingAddress</label>
//                                         <textarea
//                                             className="form-control"
//                                             value={formData.shippingAddress}
//                                             onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="modal-footer">
//                                     <button type="button" className="btn btn-secondary" onClick={closeModal}>
//                                         Cancel
//                                     </button>
//                                     <button type="submit" className="btn btn-primary">
//                                         {editingOrder ? 'Update' : 'Create'}
//                                     </button>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>
//                 </div>
//             )}
//             {showModal && <div className="modal-backdrop fade show"></div>}
//         </div>
//     );
// };

// export default Orders;
import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [error, setError] = useState('');

    const { isAdmin } = useAuth();

    useEffect(() => {
        loadOrders();
        const refreshTimer = setInterval(() => loadOrders(false), 10000);

        return () => clearInterval(refreshTimer);
    }, [page, keyword, statusFilter]);

    const loadOrders = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const response = await orderApi.getAll({
                keyword: keyword.trim() || undefined,
                status: statusFilter || undefined,
                page,
                pageSize,
            });

            setOrders(response.data.items || []);
            setTotalPages(response.data.totalPages || 0);
            setTotalCount(response.data.totalCount || 0);
        } catch (error) {
            console.error('Không thể tải đơn hàng:', error);
            setOrders([]);
            setTotalPages(0);
            setTotalCount(0);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
    };

    const openStatusModal = (order) => {
        setEditingOrder(order);
        setStatus(order.status || 'Pending');
        setPaymentStatus(order.paymentStatus || 'Unpaid');
        setError('');
        setShowModal(true);
    };

    const openDetailModal = async (order) => {
        setShowDetailModal(true);
        setSelectedOrderDetail({ order, details: [] });
        setDetailLoading(true);
        setError('');

        try {
            const response = await orderApi.getById(order.id);
            setSelectedOrderDetail(response.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
        } finally {
            setDetailLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingOrder(null);
        setStatus('');
        setPaymentStatus('');
        setError('');
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedOrderDetail(null);
        setDetailLoading(false);
        setError('');
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();

        if (!editingOrder) return;

        try {
            await orderApi.update(editingOrder.id, {
                ...editingOrder,
                status,
                paymentStatus,
            });

            closeModal();
            loadOrders();
        } catch (error) {
            setError(error.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn hủy/xóa đơn hàng này?')) return;

        try {
            await orderApi.delete(id);
            loadOrders();
        } catch (error) {
            alert('Không thể xóa đơn hàng.');
        }
    };

    const renderPagination = () => {
        const pages = [];

        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i)}>
                        {i}
                    </button>
                </li>
            );
        }

        return pages;
    };

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Quản lý đơn hàng</h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <div className="card-header">
                            <div className="row">
                                <div className="col-md-8">
                                    <form onSubmit={handleSearch} className="form-inline">
                                        <input
                                            type="text"
                                            className="form-control mr-2"
                                            placeholder="Tìm theo mã đơn, mã người dùng, địa chỉ..."
                                            value={keyword}
                                            onChange={(e) => {
                                                setKeyword(e.target.value);
                                                setPage(1);
                                            }}
                                        />

                                        <select
                                            className="form-control mr-2"
                                            value={statusFilter}
                                            onChange={(e) => {
                                                setStatusFilter(e.target.value);
                                                setPage(1);
                                            }}
                                        >
                                            <option value="">Tất cả trạng thái đơn</option>
                                            <option value="Pending">Chờ xử lý</option>
                                            <option value="Confirmed">Đã xác nhận</option>
                                            <option value="Shipping">Đang giao</option>
                                            <option value="Completed">Hoàn tất</option>
                                            <option value="Cancelled">Đã hủy</option>
                                        </select>

                                        <button type="submit" className="btn btn-primary">
                                            <i className="fas fa-search"></i> Tìm kiếm
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary"></div>
                                </div>
                            ) : (
                                <>
                                    <table className="table table-bordered table-striped">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Mã người dùng</th>
                                                <th>Ngày đặt</th>
                                                <th>Người nhận</th>
                                                <th>Tổng tiền</th>
                                                <th>Trạng thái</th>
                                                <th>Thanh toán</th>
                                                <th>Địa chỉ giao hàng</th>
                                                {isAdmin() && <th>Thao tác</th>}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {orders.length === 0 ? (
                                                <tr>
                                                    <td colSpan={isAdmin() ? 9 : 8} className="text-center">
                                                        Không tìm thấy đơn hàng
                                                    </td>
                                                </tr>
                                            ) : (
                                                orders.map(order => (
                                                    <tr key={order.id}>
                                                        <td>{order.id}</td>
                                                        <td>{order.userId}</td>
                                                        <td>{order.orderDate}</td>
                                                        <td>
                                                            <div>{order.recipientName || 'Không có'}</div>
                                                            <small className="text-muted">{order.recipientPhone || ''}</small>
                                                        </td>
                                                        <td>{Number(order.totalAmount || 0).toLocaleString()} VND</td>
                                                        <td>
                                                            <span className="badge badge-info">
                                                                {orderStatusLabels[order.status] || order.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div>{order.paymentMethod || 'COD'}</div>
                                                            <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-success' : 'badge-secondary'}`}>
                                                                {paymentStatusLabels[order.paymentStatus || 'Unpaid'] || order.paymentStatus || 'Chưa thanh toán'}
                                                            </span>
                                                        </td>
                                                        <td>{order.shippingAddress}</td>

                                                        {isAdmin() && (
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-secondary mr-1"
                                                                    onClick={() => openDetailModal(order)}
                                                                >
                                                                    <i className="fas fa-eye"></i>
                                                                </button>

                                                                <button
                                                                    className="btn btn-sm btn-info mr-1"
                                                                    onClick={() => openStatusModal(order)}
                                                                >
                                                                    <i className="fas fa-edit"></i>
                                                                </button>

                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleDelete(order.id)}
                                                                >
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>

                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>Tổng: {totalCount} đơn hàng</span>

                                        <nav>
                                            <ul className="pagination mb-0">
                                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        disabled={page === 1}
                                                        onClick={() => setPage(page - 1)}
                                                    >
                                                        Trước
                                                    </button>
                                                </li>

                                                {renderPagination()}

                                                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        disabled={page === totalPages}
                                                        onClick={() => setPage(page + 1)}
                                                    >
                                                        Sau
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {showDetailModal && (
                <div className="modal fade show" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Chi tiết đơn hàng</h5>
                                <button className="close" onClick={closeDetailModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {error && <div className="alert alert-danger">{error}</div>}

                                {detailLoading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary"></div>
                                    </div>
                                ) : (
                                    <>
                                        {selectedOrderDetail?.order && (
                                            <div className="row mb-3">
                                                <div className="col-md-6">
                                                    <p><strong>Mã đơn:</strong> {selectedOrderDetail.order.id}</p>
                                                    <p><strong>Mã người dùng:</strong> {selectedOrderDetail.order.userId}</p>
                                                    <p><strong>Ngày:</strong> {selectedOrderDetail.order.orderDate}</p>
                                                </div>
                                                <div className="col-md-6">
                                                    <p><strong>Người nhận:</strong> {selectedOrderDetail.order.recipientName || 'Không có'}</p>
                                                    <p><strong>Điện thoại:</strong> {selectedOrderDetail.order.recipientPhone || 'Không có'}</p>
                                                    <p><strong>Tổng tiền:</strong> {Number(selectedOrderDetail.order.totalAmount || 0).toLocaleString()} VND</p>
                                                </div>
                                                <div className="col-12">
                                                    <p><strong>Địa chỉ giao hàng:</strong> {selectedOrderDetail.order.shippingAddress || 'Không có'}</p>
                                                </div>
                                            </div>
                                        )}

                                        <table className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Sản phẩm</th>
                                                    <th>Mã sản phẩm</th>
                                                    <th>Số lượng</th>
                                                    <th>Đơn giá</th>
                                                    <th>Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(selectedOrderDetail?.details || []).length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center">Không có chi tiết đơn hàng</td>
                                                    </tr>
                                                ) : (
                                                    selectedOrderDetail.details.map((detail) => (
                                                        <tr key={detail.id}>
                                                            <td>{detail.product?.name || 'Không có'}</td>
                                                            <td>{detail.productId}</td>
                                                            <td>{detail.quantity}</td>
                                                            <td>{Number(detail.unitPrice || 0).toLocaleString()} VND</td>
                                                            <td>{Number((detail.unitPrice || 0) * (detail.quantity || 0)).toLocaleString()} VND</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeDetailModal}>
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal fade show" style={{ display: 'block' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Cập nhật trạng thái đơn hàng
                                </h5>

                                <button className="close" onClick={closeModal}>
                                    <span>&times;</span>
                                </button>
                            </div>

                            <form onSubmit={handleUpdateStatus}>
                                <div className="modal-body">
                                    {error && <div className="alert alert-danger">{error}</div>}

                                    {editingOrder && (
                                        <>
                                            <p><strong>Mã đơn:</strong> {editingOrder.id}</p>
                                            <p><strong>Mã người dùng:</strong> {editingOrder.userId}</p>
                                            <p><strong>Người nhận:</strong> {editingOrder.recipientName || 'Không có'} {editingOrder.recipientPhone ? `- ${editingOrder.recipientPhone}` : ''}</p>
                                            <p><strong>Tổng tiền:</strong> {Number(editingOrder.totalAmount || 0).toLocaleString()} VND</p>
                                        </>
                                    )}

                                    <div className="form-group">
                                        <label>Trạng thái đơn hàng</label>
                                        <select
                                            className="form-control"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            required
                                        >
                                            <option value="Pending">Chờ xử lý</option>
                                            <option value="Confirmed">Đã xác nhận</option>
                                            <option value="Shipping">Đang giao</option>
                                            <option value="Completed">Hoàn tất</option>
                                            <option value="Cancelled">Đã hủy</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Trạng thái thanh toán</label>
                                        <select
                                            className="form-control"
                                            value={paymentStatus}
                                            onChange={(e) => setPaymentStatus(e.target.value)}
                                            required
                                        >
                                            <option value="Unpaid">Chưa thanh toán</option>
                                            <option value="Paid">Đã thanh toán</option>
                                            <option value="Refunded">Đã hoàn tiền</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        Hủy
                                    </button>

                                    <button type="submit" className="btn btn-primary">
                                        Cập nhật trạng thái
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {(showModal || showDetailModal) && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default Orders;

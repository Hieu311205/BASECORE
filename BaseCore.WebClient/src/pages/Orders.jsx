import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [formData, setFormData] = useState({
        userId: '',
        orderDate: '',
        totalAmount: '',
        status: '',
        shippingAddress: '',
    });
    const [error, setError] = useState('');
    const { isAdmin } = useAuth();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const response = await orderApi.getAll();
            setOrders(response.data || []);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (order = null) => {
        if (order) {
            setEditingOrder(order);
            setFormData({
                userId: order.userId || '',
                orderDate: order.orderDate ? order.orderDate.substring(0, 16) : '',
                totalAmount: order.totalAmount || '',
                status: order.status || '',
                shippingAddress: order.shippingAddress || '',
            });
        } else {
            setEditingOrder(null);
            setFormData({
                userId: '',
                orderDate: '',
                totalAmount: '',
                status: '',
                shippingAddress: '',
            });
        }
        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingOrder(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const payload = {
                userId: Number(formData.userId),
                orderDate: formData.orderDate,
                totalAmount: Number(formData.totalAmount),
                status: formData.status,
                shippingAddress: formData.shippingAddress,
            };

            if (editingOrder) {
                await orderApi.update(editingOrder.id, {
                    id: editingOrder.id,
                    ...payload,
                });
            } else {
                await orderApi.create(payload);
            }

            closeModal();
            loadOrders();
        } catch (error) {
            setError(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;

        try {
            await orderApi.delete(id);
            loadOrders();
        } catch (error) {
            alert('Failed to delete order.');
        }
    };

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Orders Management</h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <div className="card-header">
                            <div className="row">
                                <div className="col-md-6">
                                    <h3 className="card-title">All Orders</h3>
                                </div>
                                <div className="col-md-6 text-right">
                                    {isAdmin() && (
                                        <button className="btn btn-success" onClick={() => openModal()}>
                                            <i className="fas fa-plus"></i> Add Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary"></div>
                                </div>
                            ) : (
                                <table className="table table-bordered table-striped">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>UserId</th>
                                            <th>OrderDate</th>
                                            <th>TotalAmount</th>
                                            <th>Status</th>
                                            <th>ShippingAddress</th>
                                            {isAdmin() && <th>Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.length === 0 ? (
                                            <tr>
                                                <td colSpan={isAdmin() ? 7 : 6} className="text-center">
                                                    No orders found
                                                </td>
                                            </tr>
                                        ) : (
                                            orders.map(order => (
                                                <tr key={order.id}>
                                                    <td>{order.id}</td>
                                                    <td>{order.userId}</td>
                                                    <td>{order.orderDate}</td>
                                                    <td>{order.totalAmount}</td>
                                                    <td>{order.status}</td>
                                                    <td>{order.shippingAddress}</td>
                                                    {isAdmin() && (
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-info mr-1"
                                                                onClick={() => openModal(order)}
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
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingOrder ? 'Edit Order' : 'Add Order'}
                                </h5>
                                <button className="close" onClick={closeModal}>
                                    <span>&times;</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {error && <div className="alert alert-danger">{error}</div>}

                                    <div className="form-group">
                                        <label>UserId</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.userId}
                                            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>OrderDate</label>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={formData.orderDate}
                                            onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>TotalAmount</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.totalAmount}
                                            onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Status</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>ShippingAddress</label>
                                        <textarea
                                            className="form-control"
                                            value={formData.shippingAddress}
                                            onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingOrder ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {showModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default Orders;
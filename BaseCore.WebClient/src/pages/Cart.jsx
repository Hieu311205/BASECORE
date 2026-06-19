import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderApi } from '../services/api';

const Cart = () => {
    const { items, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const [shippingAddress, setShippingAddress] = useState('');
    const [ordering, setOrdering] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!shippingAddress.trim()) {
            setError('Vui lòng nhập địa chỉ giao hàng.');
            return;
        }

        setOrdering(true);
        setError('');
        try {
            await orderApi.create({
                userId: user?.id,
                orderDate: new Date().toISOString(),
                totalAmount,
                shippingAddress,
                status: 'Pending',
            });
            clearCart();
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
        } finally {
            setOrdering(false);
        }
    };

    if (success) {
        return (
            <div className="container text-center py-5" style={{ paddingTop: '80px' }}>
                <i className="fas fa-check-circle fa-5x text-success mb-4"></i>
                <h3>Đặt hàng thành công!</h3>
                <p className="text-muted">Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
                <Link to="/products" className="btn btn-primary mt-3">Tiếp tục mua sắm</Link>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="container text-center py-5" style={{ paddingTop: '80px' }}>
                <i className="fas fa-shopping-cart fa-5x text-muted mb-4"></i>
                <h4 className="text-muted">Giỏ hàng của bạn đang trống</h4>
                <Link to="/products" className="btn btn-primary mt-3">Mua sắm ngay</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '60px' }}>
            <h2 className="mb-4">Giỏ hàng</h2>

            <div className="row">
                {/* Danh sách sản phẩm trong giỏ */}
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-body p-0">
                            <table className="table mb-0">
                                <thead className="thead-light">
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th className="text-center">Số lượng</th>
                                        <th className="text-right">Thành tiền</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {item.imageUrl && (
                                                        <img
                                                            src={`/assets/images/${item.imageUrl}`}
                                                            alt={item.name}
                                                            style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '12px', borderRadius: '4px' }}
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    )}
                                                    <div>
                                                        <strong>{item.name}</strong>
                                                        <br />
                                                        <small className="text-muted">{item.price?.toLocaleString('vi-VN')} VNĐ</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center" style={{ verticalAlign: 'middle' }}>
                                                <div className="input-group input-group-sm" style={{ width: '120px', margin: '0 auto' }}>
                                                    <div className="input-group-prepend">
                                                        <button
                                                            className="btn btn-outline-secondary"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        >-</button>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        className="form-control text-center"
                                                        value={item.quantity}
                                                        min="1"
                                                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                                    />
                                                    <div className="input-group-append">
                                                        <button
                                                            className="btn btn-outline-secondary"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        >+</button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-right" style={{ verticalAlign: 'middle' }}>
                                                <strong>{(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</strong>
                                            </td>
                                            <td className="text-center" style={{ verticalAlign: 'middle' }}>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-3">
                        <Link to="/products" className="btn btn-outline-secondary">
                            <i className="fas fa-arrow-left mr-2"></i>Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>

                {/* Tóm tắt đơn hàng */}
                <div className="col-lg-4 mt-4 mt-lg-0">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Tóm tắt đơn hàng</h5>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between mb-2">
                                <span>Tổng cộng:</span>
                                <strong className="text-primary">{totalAmount.toLocaleString('vi-VN')} VNĐ</strong>
                            </div>
                            <hr />

                            {error && (
                                <div className="alert alert-danger alert-sm py-2">{error}</div>
                            )}

                            {isAuthenticated ? (
                                <form onSubmit={handleCheckout}>
                                    <div className="form-group">
                                        <label>Địa chỉ giao hàng</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            placeholder="Nhập địa chỉ nhận hàng..."
                                            value={shippingAddress}
                                            onChange={(e) => setShippingAddress(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-block"
                                        disabled={ordering}
                                    >
                                        {ordering
                                            ? <span className="spinner-border spinner-border-sm mr-2"></span>
                                            : <i className="fas fa-check mr-2"></i>
                                        }
                                        Đặt hàng
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center">
                                    <p className="text-muted small">Bạn cần đăng nhập để đặt hàng</p>
                                    <Link to="/login" className="btn btn-primary btn-block">
                                        Đăng nhập để tiếp tục
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;

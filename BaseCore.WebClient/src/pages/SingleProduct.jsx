import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productApi } from '../services/api';
import { useCart } from '../contexts/CartContext';

const SingleProduct = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart(product, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    useEffect(() => {
        productApi.getById(id)
            .then(res => setProduct(res.data))
            .catch(() => setError('Không tìm thấy sản phẩm.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container py-5 text-center">
                <p className="text-muted">{error || 'Sản phẩm không tồn tại.'}</p>
                <Link to="/products" className="btn btn-primary">Quay lại danh sách</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                    <li className="breadcrumb-item"><Link to="/products">Sản phẩm</Link></li>
                    <li className="breadcrumb-item active">{product.name}</li>
                </ol>
            </nav>

            <div className="row">
                {/* Ảnh sản phẩm */}
                <div className="col-md-5 mb-4">
                    {product.imageUrl ? (
                        <img
                            src={`/assets/images/${product.imageUrl}`}
                            alt={product.name}
                            className="img-fluid rounded shadow"
                            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = '/assets/images/no-image.png'; }}
                        />
                    ) : (
                        <div
                            className="bg-light rounded d-flex align-items-center justify-content-center shadow"
                            style={{ height: '400px' }}
                        >
                            <i className="fas fa-image fa-5x text-muted"></i>
                        </div>
                    )}
                </div>

                {/* Thông tin sản phẩm */}
                <div className="col-md-7">
                    <h2>{product.name}</h2>
                    <hr />
                    <h3 className="text-primary mb-4">
                        {product.price?.toLocaleString('vi-VN')} VNĐ
                    </h3>

                    {product.description && (
                        <div className="mb-4">
                            <h6 className="font-weight-bold">Mô tả:</h6>
                            <p className="text-muted">{product.description}</p>
                        </div>
                    )}

                    <div className="mb-4">
                        <span className={`badge badge-${product.stock > 0 ? 'success' : 'danger'} p-2`}>
                            {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
                        </span>
                    </div>

                    {product.stock > 0 && (
                        <div className="d-flex align-items-center mb-4">
                            <div className="input-group" style={{ width: '130px', marginRight: '12px' }}>
                                <div className="input-group-prepend">
                                    <button className="btn btn-outline-secondary" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                                </div>
                                <input
                                    type="number"
                                    className="form-control text-center"
                                    value={quantity}
                                    min="1"
                                    max={product.stock}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                />
                                <div className="input-group-append">
                                    <button className="btn btn-outline-secondary" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
                                </div>
                            </div>
                            <button
                                className={`btn ${added ? 'btn-success' : 'btn-primary'}`}
                                onClick={handleAddToCart}
                            >
                                <i className={`fas ${added ? 'fa-check' : 'fa-cart-plus'} mr-2`}></i>
                                {added ? 'Đã thêm!' : 'Thêm vào giỏ'}
                            </button>
                        </div>
                    )}

                    <Link to="/products" className="btn btn-outline-secondary">
                        <i className="fas fa-arrow-left mr-2"></i>Quay lại
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SingleProduct;

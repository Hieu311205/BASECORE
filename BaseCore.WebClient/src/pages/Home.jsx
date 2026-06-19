import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../services/api';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        productApi.getAll({ page: 1, pageSize: 6 })
            .then(res => {
                const data = res.data;
                setProducts(data?.items || data || []);
            })
            .catch(err => console.error('Lỗi lấy sản phẩm:', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            {/* Hero */}
            <section style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff', padding: '100px 0 60px' }}>
                <div className="container text-center">
                    <h1 style={{ fontSize: '3rem', fontWeight: 700 }}>Lumière</h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '30px' }}>
                        Mùi hương đẳng cấp — Cảm xúc bất tận
                    </p>
                    <Link to="/products" className="btn btn-light btn-lg px-5">
                        Khám phá ngay
                    </Link>
                </div>
            </section>

            {/* Sản phẩm nổi bật */}
            <section className="py-5">
                <div className="container">
                    <h3 className="text-center mb-4 font-weight-bold">Sản Phẩm Mới Nhất</h3>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : (
                        <div className="row">
                            {products.map(p => (
                                <div className="col-lg-4 col-md-6 mb-4" key={p.id}>
                                    <div className="card h-100 shadow-sm border-0">
                                        {p.imageUrl && (
                                            <img
                                                src={`/assets/images/${p.imageUrl}`}
                                                className="card-img-top"
                                                alt={p.name}
                                                style={{ height: '220px', objectFit: 'cover' }}
                                                onError={e => { e.target.style.display = 'none'; }}
                                            />
                                        )}
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title">{p.name}</h5>
                                            <p className="card-text text-muted flex-grow-1" style={{ fontSize: '0.9rem' }}>
                                                {p.description?.substring(0, 80)}...
                                            </p>
                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                <strong className="text-primary">
                                                    {p.price?.toLocaleString('vi-VN')} VNĐ
                                                </strong>
                                                <Link to={`/product/${p.id}`} className="btn btn-sm btn-outline-primary">
                                                    Xem chi tiết
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-4">
                        <Link to="/products" className="btn btn-primary px-5">
                            Xem tất cả sản phẩm
                        </Link>
                    </div>
                </div>
            </section>

            {/* Cam kết */}
            <section className="py-5 bg-light">
                <div className="container">
                    <div className="row text-center">
                        <div className="col-md-4 mb-3">
                            <i className="fas fa-award fa-3x text-warning mb-3"></i>
                            <h6 className="font-weight-bold">Chất lượng cao</h6>
                            <p className="text-muted small">Nguyên liệu nhập khẩu châu Âu</p>
                        </div>
                        <div className="col-md-4 mb-3">
                            <i className="fas fa-shipping-fast fa-3x text-primary mb-3"></i>
                            <h6 className="font-weight-bold">Giao hàng nhanh</h6>
                            <p className="text-muted small">Toàn quốc trong 2-3 ngày</p>
                        </div>
                        <div className="col-md-4 mb-3">
                            <i className="fas fa-undo fa-3x text-success mb-3"></i>
                            <h6 className="font-weight-bold">Đổi trả dễ dàng</h6>
                            <p className="text-muted small">Hoàn tiền 100% trong 7 ngày</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;

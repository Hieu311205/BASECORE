import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productApi, categoryApi } from '../services/api';
import { useCart } from '../contexts/CartContext';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToCart } = useCart();
    const [addedId, setAddedId] = useState(null);

    const handleAddToCart = (product) => {
        addToCart(product, 1);
        setAddedId(product.id);
        setTimeout(() => setAddedId(null), 1500);
    };

    const keyword = searchParams.get('keyword') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const page = parseInt(searchParams.get('page') || '1');

    useEffect(() => {
        loadData();
    }, [keyword, categoryId, page]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                productApi.getAll({ keyword, categoryId: categoryId || undefined, page, pageSize: 9 }),
                categoryApi.getAll(),
            ]);
            const data = productsRes.data;
            setProducts(data?.items || data || []);
            setCategories(categoriesRes.data || []);
        } catch (err) {
            console.error('Lỗi tải sản phẩm:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const kw = e.target.keyword.value.trim();
        setSearchParams({ keyword: kw, categoryId, page: 1 });
    };

    const handleCategoryChange = (catId) => {
        setSearchParams({ keyword, categoryId: catId, page: 1 });
    };

    return (
        <section className="section" id="products" style={{ paddingTop: '60px' }}>
            <div className="container">
                <div className="section-heading text-center mb-5">
                    <h2>Tất Cả Sản Phẩm</h2>
                    <span>Khám phá bộ sưu tập của chúng tôi</span>
                </div>

                {/* Bộ lọc */}
                <div className="row mb-4">
                    <div className="col-md-6">
                        <form onSubmit={handleSearch} className="input-group">
                            <input
                                name="keyword"
                                type="text"
                                className="form-control"
                                placeholder="Tìm kiếm sản phẩm..."
                                defaultValue={keyword}
                            />
                            <div className="input-group-append">
                                <button type="submit" className="btn btn-primary">
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="col-md-6">
                        <select
                            className="form-control"
                            value={categoryId}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Danh sách sản phẩm */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <i className="fas fa-box-open fa-3x mb-3"></i>
                        <p>Không tìm thấy sản phẩm nào.</p>
                    </div>
                ) : (
                    <div className="row">
                        {products.map(p => (
                            <div className="col-lg-4 col-md-6 mb-4" key={p.id}>
                                <div className="card h-100 shadow-sm">
                                    {p.imageUrl && (
                                        <img
                                            src={`/assets/images/${p.imageUrl}`}
                                            className="card-img-top"
                                            alt={p.name}
                                            style={{ height: '220px', objectFit: 'cover' }}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    )}
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title">{p.name}</h5>
                                        <p className="card-text text-muted flex-grow-1" style={{ fontSize: '0.9rem' }}>
                                            {p.description?.substring(0, 80)}...
                                        </p>
                                        <div className="mt-2">
                                            <strong className="text-primary d-block mb-2">
                                                {p.price?.toLocaleString('vi-VN')} VNĐ
                                            </strong>
                                            <div className="d-flex gap-2">
                                                <Link to={`/product/${p.id}`} className="btn btn-sm btn-outline-primary flex-grow-1">
                                                    Xem chi tiết
                                                </Link>
                                                <button
                                                    className={`btn btn-sm ${addedId === p.id ? 'btn-success' : 'btn-primary'}`}
                                                    onClick={() => handleAddToCart(p)}
                                                >
                                                    <i className={`fas ${addedId === p.id ? 'fa-check' : 'fa-cart-plus'}`}></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductPage;

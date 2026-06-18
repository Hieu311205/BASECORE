import React, { useEffect, useMemo, useState } from 'react';
import { productApi } from '../services/api';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [stockFilter, setStockFilter] = useState('low');
    const [lowStockThreshold, setLowStockThreshold] = useState(10);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [editingProduct, setEditingProduct] = useState(null);
    const [stockValue, setStockValue] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        loadProducts();
    }, [page, stockFilter, lowStockThreshold]);

    const loadProducts = async () => {
        setLoading(true);
        setError('');

        try {
            const stockParams = getStockParams();
            const response = await productApi.getAll({
                keyword: keyword.trim() || undefined,
                page,
                pageSize,
                ...stockParams,
            });
            setProducts(response.data?.items || response.data?.data || response.data || []);
            setTotalPages(response.data?.totalPages || 0);
            setTotalCount(response.data?.totalCount || 0);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải tồn kho');
            setProducts([]);
            setTotalPages(0);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    const getStockParams = () => {
        if (stockFilter === 'low') return { minStock: 1, maxStock: lowStockThreshold };
        if (stockFilter === 'out') return { maxStock: 0 };
        if (stockFilter === 'available') return { minStock: lowStockThreshold + 1 };
        return {};
    };

    const stats = useMemo(() => {
        return products.reduce(
            (result, product) => {
                const stock = Number(product.stock || 0);
                result.totalStock += stock;
                if (stock <= 0) result.outOfStock += 1;
                if (stock > 0 && stock <= lowStockThreshold) result.lowStock += 1;
                return result;
            },
            { totalStock: 0, lowStock: 0, outOfStock: 0 }
        );
    }, [products, lowStockThreshold]);

    const openStockModal = (product) => {
        setEditingProduct(product);
        setStockValue(Number(product.stock || 0));
        setError('');
    };

    const closeStockModal = () => {
        setEditingProduct(null);
        setStockValue(0);
        setError('');
    };

    const handleStockSubmit = async (e) => {
        e.preventDefault();
        if (!editingProduct) return;

        try {
            await productApi.update(editingProduct.id, {
                stock: Number(stockValue),
            });

            closeStockModal();
            loadProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể cập nhật tồn kho');
        }
    };

    const getStockBadge = (stock) => {
        if (stock <= 0) return <span className="badge badge-danger">Hết hàng</span>;
        if (stock <= lowStockThreshold) return <span className="badge badge-warning">Sắp hết hàng</span>;
        return <span className="badge badge-success">Còn hàng</span>;
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (page === 1) {
            loadProducts();
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

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Quản lý tồn kho</h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-4 col-6">
                            <div className="small-box bg-info">
                                <div className="inner">
                                    <h3>{stats.totalStock}</h3>
                                    <p>Tổng tồn kho</p>
                                </div>
                                <div className="icon"><i className="fas fa-boxes"></i></div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>{stats.lowStock}</h3>
                                    <p>Sắp hết hàng</p>
                                </div>
                                <div className="icon"><i className="fas fa-exclamation-triangle"></i></div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-6">
                            <div className="small-box bg-danger">
                                <div className="inner">
                                    <h3>{stats.outOfStock}</h3>
                                    <p>Hết hàng</p>
                                </div>
                                <div className="icon"><i className="fas fa-times-circle"></i></div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="row">
                                <div className="col-md-9">
                                    <form className="form-inline" onSubmit={handleSearch}>
                                        <input
                                            type="text"
                                            className="form-control mr-2"
                                            placeholder="Tìm sản phẩm, SKU, danh mục, nhà cung cấp..."
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                        />
                                        <select
                                            className="form-control mr-2"
                                            value={stockFilter}
                                            onChange={(e) => {
                                                setStockFilter(e.target.value);
                                                setPage(1);
                                            }}
                                        >
                                            <option value="all">Tất cả tồn kho</option>
                                            <option value="low">Sắp hết hàng</option>
                                            <option value="out">Hết hàng</option>
                                            <option value="available">Còn hàng</option>
                                        </select>
                                        <input
                                            type="number"
                                            className="form-control mr-2"
                                            style={{ width: '130px' }}
                                            min="0"
                                            value={lowStockThreshold}
                                            onChange={(e) => {
                                                setLowStockThreshold(Number(e.target.value));
                                                setPage(1);
                                            }}
                                        />
                                        <button type="submit" className="btn btn-primary mr-2">
                                            <i className="fas fa-search"></i> Tìm kiếm
                                        </button>
                                        <button type="button" className="btn btn-secondary" onClick={loadProducts}>
                                            <i className="fas fa-sync-alt"></i> Tải lại
                                        </button>
                                    </form>
                                </div>
                            </div>
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
                                                <th>ID</th>
                                                <th>Sản phẩm</th>
                                                <th>SKU</th>
                                                <th>Danh mục</th>
                                                <th>Nhà cung cấp</th>
                                                <th>Tồn kho</th>
                                                <th>Trạng thái</th>
                                                <th style={{ width: '120px' }}>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="text-center">Không tìm thấy mặt hàng tồn kho</td>
                                                </tr>
                                            ) : (
                                                products.map((product) => (
                                                    <tr key={product.id}>
                                                        <td>{product.id}</td>
                                                        <td>{product.name}</td>
                                                        <td>{product.sku || 'Không có'}</td>
                                                        <td>{product.category?.name || 'Không có'}</td>
                                                        <td>{product.supplier?.name || 'Không có'}</td>
                                                        <td>{product.stock}</td>
                                                        <td>{getStockBadge(Number(product.stock || 0))}</td>
                                                        <td>
                                                            <button className="btn btn-sm btn-info" onClick={() => openStockModal(product)}>
                                                                <i className="fas fa-edit"></i> Tồn kho
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>Hiển thị: {products.length} / {totalCount} mặt hàng tồn kho</span>
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

            {editingProduct && (
                <div className="modal fade show admin-modal" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Cập nhật tồn kho</h5>
                                <button type="button" className="close" onClick={closeStockModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleStockSubmit}>
                                <div className="modal-body">
                                    {error && <div className="alert alert-danger">{error}</div>}
                                    <p><strong>Sản phẩm:</strong> {editingProduct.name}</p>
                                    <div className="form-group">
                                        <label>Tồn kho</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="0"
                                            value={stockValue}
                                            onChange={(e) => setStockValue(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeStockModal}>Hủy</button>
                                    <button type="submit" className="btn btn-primary">Cập nhật</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {editingProduct && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default Inventory;

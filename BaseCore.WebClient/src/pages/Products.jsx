import React, { useState, useEffect } from 'react';
import { productApi, categoryApi, suppliersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        stock: 0,
        description: '',
        imageUrl: '',
        categoryId: '',
        supplierId: '',
        sku: '',
        slug: '',
        isActive: true,
    });
    const [error, setError] = useState('');
    const { isAdmin } = useAuth();

    useEffect(() => {
        loadCategories();
        loadSuppliers();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [page, keyword, categoryId, statusFilter, minPrice, maxPrice]);

    const loadCategories = async () => {
        try {
            const response = await categoryApi.getAll({ page: 1, pageSize: 1000 });
            setCategories(response.data.items || response.data || []);
        } catch (error) {
            console.error('Không thể tải danh mục:', error);
        }
    };

    const loadSuppliers = async () => {
        try {
            const response = await suppliersApi.getAll({ page: 1, pageSize: 1000, isActive: true });
            setSuppliers(response.data.items || response.data || []);
        } catch (error) {
            console.error('Không thể tải nhà cung cấp:', error);
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const statusParam = statusFilter === 'active'
                ? true
                : statusFilter === 'inactive'
                    ? false
                    : undefined;

            const response = await productApi.search({
                keyword,
                categoryId: categoryId || undefined,
                isActive: statusParam,
                minPrice: minPrice || undefined,
                maxPrice: maxPrice || undefined,
                page,
                pageSize,
            });
            setProducts(response.data.items || response.data.data || []);
            setTotalPages(response.data.totalPages || 0);
            setTotalCount(response.data.totalCount || 0);
        } catch (error) {
            console.error('Không thể tải sản phẩm:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter((product) => {
        const price = Number(product.price || 0);
        const min = minPrice === '' ? null : Number(minPrice);
        const max = maxPrice === '' ? null : Number(maxPrice);

        if (min !== null && price < min) return false;
        if (max !== null && price > max) return false;

        return true;
    });

    const handleSearch = (e) => {
        e.preventDefault();
        if (page === 1) {
            loadProducts();
        } else {
            setPage(1);
        }
    };

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                price: product.price,
                stock: product.stock,
                description: product.description || '',
                imageUrl: product.imageUrl || '',
                categoryId: product.categoryId,
                supplierId: product.supplierId || '',
                sku: product.sku || '',
                slug: product.slug || '',
                isActive: product.isActive !== false,
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                price: 0,
                stock: 0,
                description: '',
                imageUrl: '',
                categoryId: categories[0]?.id || '',
                supplierId: '',
                sku: '',
                slug: '',
                isActive: true,
            });
        }
        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                categoryId: parseInt(formData.categoryId),
                supplierId: formData.supplierId ? parseInt(formData.supplierId) : null,
                isActive: Boolean(formData.isActive),
            };

            if (editingProduct) {
                await productApi.update(editingProduct.id, { id: editingProduct.id, ...data });
            } else {
                await productApi.create(data);
            }

            closeModal();
            loadProducts();
        } catch (error) {
            setError(error.response?.data?.message || 'Thao tác thất bại');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

        try {
            await productApi.delete(id);
            loadProducts();
        } catch (error) {
            alert('Không thể xóa sản phẩm');
        }
    };

    const getProductImageValue = (product) => product.imageUrl || product.ImageUrl || product.image || product.Image || '';

    const getPlaceholderImage = (product) => {
        const label = String(product.name || 'Sản phẩm')
            .slice(0, 18)
            .replace(/[&<>]/g, '');

        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
                <rect width="96" height="96" fill="#f4f6f9"/>
                <rect x="10" y="10" width="76" height="76" rx="8" fill="#ffffff" stroke="#d6dbe1"/>
                <text x="48" y="44" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#6c757d">Không có ảnh</text>
                <text x="48" y="60" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#adb5bd">${label}</text>
            </svg>
        `)}`;
    };

    const getProductImageSrc = (product) => {
        const imageUrl = String(getProductImageValue(product)).trim();

        if (!imageUrl) return getPlaceholderImage(product);
        if (/^(https?:)?\/\//i.test(imageUrl) || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) return imageUrl;
        if (imageUrl.startsWith('/')) return imageUrl;
        if (imageUrl.startsWith('assets/')) return `/${imageUrl}`;

        return `/assets/images/${imageUrl}`;
    };

    const renderProductImage = (product) => {
        return (
            <img
                src={getProductImageSrc(product)}
                alt={product.name || 'Ảnh sản phẩm'}
                style={{
                    width: '64px',
                    height: '64px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                }}
                onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getPlaceholderImage(product);
                }}
            />
        );
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
                            <h1 className="m-0">Quản lý sản phẩm</h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <div className="card-header">
                            <div className="row">
                                <div className="col-md-9">
                                    <form
                                        onSubmit={handleSearch}
                                        className="d-flex flex-wrap align-items-center"
                                        style={{ gap: '8px' }}
                                    >
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ width: '220px' }}
                                            placeholder="Tìm kiếm..."
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                        />
                                        <select
                                            className="form-control"
                                            style={{ width: '190px' }}
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(e.target.value)}
                                        >
                                            <option value="">Tất cả danh mục</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="form-control"
                                            style={{ width: '180px' }}
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="all">Tất cả trạng thái</option>
                                            <option value="active">Đang hoạt động</option>
                                            <option value="inactive">Ngừng hoạt động</option>
                                        </select>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{ width: '140px' }}
                                            placeholder="Giá từ (VND)"
                                            min="0"
                                            value={minPrice}
                                            onChange={(e) => {
                                                setMinPrice(e.target.value);
                                                setPage(1);
                                            }}
                                        />
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{ width: '140px' }}
                                            placeholder="Giá đến (VND)"
                                            min="0"
                                            value={maxPrice}
                                            onChange={(e) => {
                                                setMaxPrice(e.target.value);
                                                setPage(1);
                                            }}
                                        />
                                        <button type="submit" className="btn btn-primary">
                                            <i className="fas fa-search"></i> Tìm kiếm
                                        </button>
                                    </form>
                                </div>
                                <div className="col-md-3 text-right">
                                    {isAdmin() && (
                                        <button className="btn btn-success" onClick={() => openModal()}>
                                            <i className="fas fa-plus"></i> Thêm sản phẩm
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
                                <>
                                    <table className="table table-bordered table-striped">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Ảnh</th>
                                                <th>Tên</th>
                                                <th>SKU</th>
                                                <th>Danh mục</th>
                                                <th>Nhà cung cấp</th>
                                                <th>Giá</th>
                                                <th>Tồn kho</th>
                                                <th>Trạng thái</th>
                                                {isAdmin() && <th>Thao tác</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProducts.length === 0 ? (
                                                <tr>
                                                    <td colSpan={isAdmin() ? 10 : 9} className="text-center">
                                                        Không tìm thấy sản phẩm
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredProducts.map(product => (
                                                    <tr key={product.id}>
                                                        <td>{product.id}</td>
                                                        <td>
                                                            {renderProductImage(product)}
                                                        </td>
                                                        <td>{product.name}</td>
                                                        <td>{product.sku || 'Không có'}</td>
                                                        <td>{product.category?.name}</td>
                                                        <td>{product.supplier?.name || 'Không có'}</td>
                                                        <td>{product.price?.toLocaleString()} VND</td>
                                                        <td>{product.stock}</td>
                                                        <td>{product.isActive === false ? 'Ngừng hoạt động' : 'Đang hoạt động'}</td>
                                                        {isAdmin() && (
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-info mr-1"
                                                                    onClick={() => openModal(product)}
                                                                >
                                                                    <i className="fas fa-edit"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleDelete(product.id)}
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
                                        <span>Hiển thị: {filteredProducts.length} / {totalCount} sản phẩm</span>
                                        <nav>
                                            <ul className="pagination mb-0">
                                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => setPage(page - 1)}>
                                                        Trước
                                                    </button>
                                                </li>
                                                {renderPagination()}
                                                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => setPage(page + 1)}>
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

            {/* Modal */}
            {showModal && (
                <div className="modal fade show admin-modal" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
                                </h5>
                                <button type="button" className="close" onClick={closeModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {error && <div className="alert alert-danger">{error}</div>}
                                    <div className="form-group">
                                        <label>Tên</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Danh mục</label>
                                        <select
                                            className="form-control"
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                            required
                                        >
                                            <option value="">Chọn danh mục</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Nhà cung cấp</label>
                                        <select
                                            className="form-control"
                                            value={formData.supplierId}
                                            onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                        >
                                            <option value="">Không có nhà cung cấp</option>
                                            {suppliers.map(supplier => (
                                                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>SKU</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.sku}
                                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Slug</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Giá</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tồn kho</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Đường dẫn ảnh</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.imageUrl}
                                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Mô tả</label>
                                        <textarea
                                            className="form-control"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows="3"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Trạng thái</label>
                                        <select
                                            className="form-control"
                                            value={String(formData.isActive)}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                                        >
                                            <option value="true">Đang hoạt động</option>
                                            <option value="false">Ngừng hoạt động</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingProduct ? 'Cập nhật' : 'Tạo mới'}
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

export default Products;

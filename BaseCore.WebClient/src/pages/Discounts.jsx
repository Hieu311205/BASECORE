import React, { useEffect, useState } from 'react';
import { promotionsApi } from '../services/api';

const defaultForm = {
    name: '',
    promoType: 'percent',
    value: 10,
    minOrder: 0,
    startDate: '',
    endDate: '',
    isActive: true,
};

const Discounts = () => {
    const [discounts, setDiscounts] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [formData, setFormData] = useState(defaultForm);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDiscounts();
    }, [page, statusFilter]);

    const toDateInputValue = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toISOString().slice(0, 10);
    };

    const loadDiscounts = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await promotionsApi.getAll({
                keyword: keyword.trim() || undefined,
                isActive: statusFilter === '' ? undefined : statusFilter,
                page,
                pageSize,
            });

            setDiscounts(response.data?.items || []);
            setTotalPages(response.data?.totalPages || 0);
            setTotalCount(response.data?.totalCount || 0);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải mã giảm giá');
            setDiscounts([]);
            setTotalPages(0);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (discount = null) => {
        setEditingDiscount(discount);
        setFormData(discount ? {
            name: discount.name || '',
            promoType: discount.promoType || 'percent',
            value: discount.value ?? 0,
            minOrder: discount.minOrder ?? 0,
            startDate: toDateInputValue(discount.startDate),
            endDate: toDateInputValue(discount.endDate),
            isActive: discount.isActive !== false,
        } : defaultForm);
        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingDiscount(null);
        setFormData(defaultForm);
        setError('');
    };

    const handleSearch = (event) => {
        event.preventDefault();
        if (page === 1) {
            loadDiscounts();
        } else {
            setPage(1);
        }
    };

    const normalizeNumberInput = (value, maxValue = null) => {
        if (value === '') return '';

        const normalized = String(value).replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '');
        const numericValue = Number(normalized || 0);

        if (maxValue !== null && numericValue > maxValue) {
            return String(maxValue);
        }

        return normalized || '0';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        const payload = {
            name: formData.name.trim().toUpperCase(),
            promoType: formData.promoType,
            value: Number(formData.value),
            minOrder: Number(formData.minOrder),
            startDate: formData.startDate || null,
            endDate: formData.endDate || null,
            isActive: Boolean(formData.isActive),
        };

        if (!payload.name) {
            setError('Mã giảm giá là bắt buộc');
            return;
        }

        try {
            if (editingDiscount) {
                await promotionsApi.update(editingDiscount.id, payload);
            } else {
                await promotionsApi.create(payload);
            }

            closeModal();
            loadDiscounts();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể lưu mã giảm giá');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return;

        try {
            await promotionsApi.delete(id);
            loadDiscounts();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể xóa mã giảm giá');
        }
    };

    const formatDiscountValue = (discount) => {
        return discount.promoType === 'percent'
            ? `${discount.value}%`
            : `${Number(discount.value || 0).toLocaleString()} VND`;
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
                            <h1 className="m-0">Mã giảm giá</h1>
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
                                    <form className="form-inline" onSubmit={handleSearch}>
                                        <input
                                            className="form-control mr-2"
                                            placeholder="Tìm mã giảm giá..."
                                            value={keyword}
                                            onChange={(event) => setKeyword(event.target.value)}
                                        />
                                        <select
                                            className="form-control mr-2"
                                            value={statusFilter}
                                            onChange={(event) => {
                                                setStatusFilter(event.target.value);
                                                setPage(1);
                                            }}
                                        >
                                            <option value="">Tất cả trạng thái</option>
                                            <option value="true">Đang hoạt động</option>
                                            <option value="false">Ngừng hoạt động</option>
                                        </select>
                                        <button type="submit" className="btn btn-primary mr-2">
                                            <i className="fas fa-search"></i> Tìm kiếm
                                        </button>
                                        <button type="button" className="btn btn-secondary" onClick={loadDiscounts}>
                                            <i className="fas fa-sync-alt"></i> Tải lại
                                        </button>
                                    </form>
                                </div>
                                <div className="col-md-4 text-right">
                                    <button className="btn btn-success" onClick={() => openModal()}>
                                        <i className="fas fa-plus"></i> Thêm mã giảm giá
                                    </button>
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
                                                <th>Mã/Tên</th>
                                                <th>Loại</th>
                                                <th>Giá trị</th>
                                                <th>Đơn tối thiểu</th>
                                                <th>Bắt đầu</th>
                                                <th>Kết thúc</th>
                                                <th>Trạng thái</th>
                                                <th style={{ width: '140px' }}>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {discounts.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="text-center">Không tìm thấy mã giảm giá</td>
                                                </tr>
                                            ) : (
                                                discounts.map((discount) => (
                                                    <tr key={discount.id}>
                                                        <td><strong>{discount.name}</strong></td>
                                                        <td>{discount.promoType === 'percent' ? 'Phần trăm' : 'Số tiền cố định'}</td>
                                                        <td>{formatDiscountValue(discount)}</td>
                                                        <td>{Number(discount.minOrder || 0).toLocaleString()} VND</td>
                                                        <td>{toDateInputValue(discount.startDate) || 'Không có'}</td>
                                                        <td>{toDateInputValue(discount.endDate) || 'Không hết hạn'}</td>
                                                        <td>
                                                            <span className={`badge ${discount.isActive ? 'badge-success' : 'badge-secondary'}`}>
                                                                {discount.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button className="btn btn-sm btn-info mr-1" onClick={() => openModal(discount)}>
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(discount.id)}>
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>

                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>Hiển thị: {discounts.length} / {totalCount} mã giảm giá</span>
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

            {showModal && (
                <div className="modal fade show admin-modal" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editingDiscount ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'}</h5>
                                <button type="button" className="close" onClick={closeModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {error && <div className="alert alert-danger">{error}</div>}
                                    <div className="form-group">
                                        <label>Mã/Tên</label>
                                        <input
                                            className="form-control"
                                            value={formData.name}
                                            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Loại</label>
                                        <select
                                            className="form-control"
                                            value={formData.promoType}
                                            onChange={(event) => {
                                                const promoType = event.target.value;
                                                setFormData({
                                                    ...formData,
                                                    promoType,
                                                    value: promoType === 'percent'
                                                        ? normalizeNumberInput(formData.value, 100)
                                                        : normalizeNumberInput(formData.value),
                                                });
                                            }}
                                        >
                                            <option value="percent">Phần trăm</option>
                                            <option value="fixed">Số tiền cố định</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Giá trị</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="0"
                                            value={formData.value}
                                            onChange={(event) => setFormData({
                                                ...formData,
                                                value: normalizeNumberInput(
                                                    event.target.value,
                                                    formData.promoType === 'percent' ? 100 : null
                                                ),
                                            })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Đơn tối thiểu (VND)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="0"
                                            value={formData.minOrder}
                                            onChange={(event) => setFormData({
                                                ...formData,
                                                minOrder: normalizeNumberInput(event.target.value),
                                            })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Ngày bắt đầu</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={formData.startDate}
                                            onChange={(event) => setFormData({ ...formData, startDate: event.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Ngày kết thúc</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={formData.endDate}
                                            onChange={(event) => setFormData({ ...formData, endDate: event.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <div className="custom-control custom-switch">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                id="discountActive"
                                                checked={formData.isActive}
                                                onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })}
                                            />
                                            <label className="custom-control-label" htmlFor="discountActive">Đang hoạt động</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Hủy</button>
                                    <button type="submit" className="btn btn-primary">Lưu</button>
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

export default Discounts;

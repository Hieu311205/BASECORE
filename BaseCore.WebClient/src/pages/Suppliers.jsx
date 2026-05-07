import React, { useState, useEffect } from 'react';
import { suppliersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        isActive: true
    });

    const { isAdmin } = useAuth();

    useEffect(() => {
        loadSuppliers();
    }, [page, keyword, statusFilter]);

    const getArrayData = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.items)) return data.items;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data?.suppliers)) return data.suppliers;
        return [];
    };

    const getSupplierIsActive = (supplier) => {
        if (typeof supplier.isActive === 'boolean') return supplier.isActive;
        if (typeof supplier.IsActive === 'boolean') return supplier.IsActive;
        if (typeof supplier.status === 'string') return supplier.status.toLowerCase() === 'active';
        return Boolean(supplier.isActive ?? supplier.IsActive);
    };

    const filterSuppliers = (list, params = {}) => {
        const normalizedKeyword = (params.keyword || '').toLowerCase().trim();
        const status = params.isActive;

        return list.filter(supplier => {
            const matchesKeyword =
                !normalizedKeyword ||
                supplier.name?.toLowerCase().includes(normalizedKeyword) ||
                supplier.Name?.toLowerCase().includes(normalizedKeyword) ||
                supplier.contactName?.toLowerCase().includes(normalizedKeyword) ||
                supplier.ContactName?.toLowerCase().includes(normalizedKeyword) ||
                supplier.email?.toLowerCase().includes(normalizedKeyword) ||
                supplier.Email?.toLowerCase().includes(normalizedKeyword) ||
                supplier.phone?.toLowerCase().includes(normalizedKeyword) ||
                supplier.Phone?.toLowerCase().includes(normalizedKeyword) ||
                supplier.address?.toLowerCase().includes(normalizedKeyword) ||
                supplier.Address?.toLowerCase().includes(normalizedKeyword);

            const matchesStatus =
                !status ||
                String(getSupplierIsActive(supplier)) === status;

            return matchesKeyword && matchesStatus;
        });
    };

    const loadSuppliers = async () => {
        setLoading(true);
        try {
            const response = await suppliersApi.search({
                keyword: keyword.trim() || undefined,
                isActive: statusFilter || undefined,
                page,
                pageSize
            });
            console.log('SUPPLIERS RESPONSE:', response.data);

            const list = getArrayData(response.data);
            setSuppliers(filterSuppliers(list, {
                keyword,
                isActive: statusFilter || undefined
            }));
            setTotalPages(response.data.totalPages || 0);
            setTotalCount(response.data.totalCount || list.length);
        } catch (error) {
            console.error('Failed to load suppliers:', error);
            setSuppliers([]);
            setTotalPages(0);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
    };

    const handleStatusChange = (e) => {
        const value = e.target.value;
        setStatusFilter(value);
        setPage(1);
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

    const openModal = (supplier = null) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name || '',
                contactName: supplier.contactName || '',
                email: supplier.email || '',
                phone: supplier.phone || '',
                address: supplier.address || '',
                isActive: supplier.isActive ?? supplier.IsActive ?? true
            });
        } else {
            setEditingSupplier(null);
            setFormData({
                name: '',
                contactName: '',
                email: '',
                phone: '',
                address: '',
                isActive: true
            });
        }

        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSupplier(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const data = {
                ...formData,
                isActive: Boolean(formData.isActive)
            };

            if (editingSupplier) {
                await suppliersApi.update(editingSupplier.id, {
                    id: editingSupplier.id,
                    ...data
                });
            } else {
                await suppliersApi.create(data);
            }

            closeModal();
            loadSuppliers();
        } catch (error) {
            setError(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;

        try {
            await suppliersApi.delete(id);
            loadSuppliers();
        } catch (error) {
            alert('Failed to delete supplier');
        }
    };

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Suppliers Management</h1>
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
                                    <form onSubmit={handleSearch} className="form-inline">
                                        <input
                                            type="text"
                                            className="form-control mr-2"
                                            placeholder="Search supplier..."
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                        />
                                        <select
                                            className="form-control mr-2"
                                            value={statusFilter}
                                            onChange={handleStatusChange}
                                        >
                                            <option value="">All Status</option>
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                        <button type="submit" className="btn btn-primary mr-2">
                                            <i className="fas fa-search"></i> Search
                                        </button>
                                        <button
                                            type="button"
            className="btn btn-secondary"
                                            onClick={() => {
                                                setKeyword('');
                                                setStatusFilter('');
                                                setPage(1);
                                            }}
                                        >
                                            Reset
                                        </button>
                                    </form>
                                </div>

                                <div className="col-md-6 text-right">
                                    {isAdmin() && (
                                        <button className="btn btn-success" onClick={() => openModal()}>
                                            <i className="fas fa-plus"></i> Add Supplier
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
                                                <th>Name</th>
                                                <th>Contact Name</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>Address</th>
                                                <th>Status</th>
                                                {isAdmin() && <th>Actions</th>}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {suppliers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={isAdmin() ? 8 : 7} className="text-center">
                                                        No suppliers found
                                                    </td>
                                                </tr>
                                            ) : (
                                                suppliers.map(supplier => (
                                                    <tr key={supplier.id}>
                                                        <td>{supplier.id}</td>
                                                        <td>{supplier.name}</td>
                                                        <td>{supplier.contactName || 'N/A'}</td>
                                                        <td>{supplier.email}</td>
                                                        <td>{supplier.phone}</td>
                                                        <td>{supplier.address}</td>
                                                        <td>
                                                            {getSupplierIsActive(supplier) ? (
                                                                <span className="badge badge-success">Active</span>
                                                            ) : (
                                                                <span className="badge badge-danger">Inactive</span>
                                                            )}
                                                        </td>

                                                        {isAdmin() && (
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-info mr-1"
                                                                    onClick={() => openModal(supplier)}
                                                                >
                                                                    <i className="fas fa-edit"></i>
                                                                </button>

                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleDelete(supplier.id)}
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
                                        <span>Showing: {suppliers.length} of {totalCount} suppliers</span>
                                        <nav>
                                            <ul className="pagination mb-0">
                                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => setPage(page - 1)}
                                                        disabled={page === 1}
                                                    >
                                                        Previous
                                                    </button>
                                                </li>
                                                {renderPagination()}
                                                <li className={`page-item ${page === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => setPage(page + 1)}
                                                        disabled={page === totalPages || totalPages === 0}
                                                    >
                                                        Next
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

            {showModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
                                </h5>
                                <button type="button" className="close" onClick={closeModal}>
                                    <span>&times;</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {error && <div className="alert alert-danger">{error}</div>}

                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Contact Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.contactName}
                                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Address</label>
                                        <textarea
                                            className="form-control"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            rows="3"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            className="form-control"
                                            value={String(formData.isActive)}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    isActive: e.target.value === 'true'
                                                })
                                            }
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingSupplier ? 'Update' : 'Create'}
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

export default Suppliers;

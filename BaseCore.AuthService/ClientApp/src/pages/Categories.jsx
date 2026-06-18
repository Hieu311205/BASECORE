import React, { useState, useEffect } from 'react';
import { categoriesApi } from '../services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const normalizeCategoryResponse = (data) => {
    if (Array.isArray(data)) {
      const normalizedKeyword = keyword.trim().toLowerCase();
      const filtered = normalizedKeyword
        ? data.filter((category) =>
          category.name?.toLowerCase().includes(normalizedKeyword) ||
          category.description?.toLowerCase().includes(normalizedKeyword))
        : data;
      const startIndex = (page - 1) * pageSize;

      return {
        items: filtered.slice(startIndex, startIndex + pageSize),
        totalCount: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize) || 1,
      };
    }

    return {
      items: data?.items || data?.data || [],
      totalCount: data?.totalCount ?? data?.items?.length ?? data?.data?.length ?? 0,
      totalPages: data?.totalPages ?? (Math.ceil((data?.totalCount ?? 0) / pageSize) || 0),
    };
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesApi.getAll({
        keyword: keyword.trim() || undefined,
        page,
        pageSize,
      });
      const result = normalizeCategoryResponse(response.data);

      setCategories(result.items);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
      setTotalPages(0);
      setTotalCount(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, [keyword, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
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

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoriesApi.delete(id);
        fetchCategories();
      } catch (error) {
        alert('Failed to delete category');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, formData);
      } else {
        await categoriesApi.create(formData);
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      alert('Failed to save category');
    }
  };

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Categories</h1>
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
                      placeholder="Search..."
                      value={keyword}
                      onChange={(e) => {
                        setKeyword(e.target.value);
                        setPage(1);
                      }}
                    />
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-search"></i> Search
                    </button>
                  </form>
                </div>
                <div className="col-md-6 text-right">
                  <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="fas fa-plus"></i> Add Category
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body table-responsive p-0">
              {loading ? (
                <div className="text-center p-3">Loading...</div>
              ) : (
                <table className="table table-hover text-nowrap">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td>{category.id}</td>
                        <td>{category.name}</td>
                        <td>{category.description}</td>
                        <td>
                          <button className="btn btn-sm btn-info mr-1" onClick={() => handleEdit(category)}>
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(category.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="card-footer d-flex justify-content-between align-items-center">
              <span>Total: {totalCount} categories</span>
              <nav>
                <ul className="pagination pagination-sm m-0">
                  <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" disabled={page === 1} onClick={() => setPage(page - 1)}>
                      Previous
                    </button>
                  </li>
                  {renderPagination()}
                  <li className={`page-item ${page === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      disabled={page === totalPages || totalPages === 0}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">{editingCategory ? 'Edit Category' : 'Add Category'}</h4>
                <button type="button" className="close" onClick={() => setShowModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
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
                    <label>Description</label>
                    <textarea
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Categories;

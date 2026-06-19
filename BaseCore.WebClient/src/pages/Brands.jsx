// Mẫu page module Thương hiệu.
// Hiện tại toàn bộ đang comment để chưa chạy.
// Khi muốn bật module này:
// 1. Bỏ comment file này.
// 2. Import Brands trong App.jsx.
// 3. Thêm route /brands trong App.jsx.
// 4. Thêm menu /brands trong MainLayout.jsx.
// 5. Bỏ comment brandsApi trong services/api.js.

// import React, { useEffect, useState } from 'react';
// import { brandsApi } from '../services/api';

// const Brands = () => {
//     const [brands, setBrands] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [showModal, setShowModal] = useState(false);
//     const [editingBrand, setEditingBrand] = useState(null);
//     const [formData, setFormData] = useState({
//         name: '',
//         description: '',
//         isActive: true,
//     });

//     useEffect(() => {
//         loadBrands();
//     }, []);

//     const loadBrands = async () => {
//         try {
//             setLoading(true);
//             const response = await brandsApi.getAll();
//             setBrands(response.data?.items || response.data?.data || response.data || []);
//         } catch (err) {
//             setError('Không thể tải danh sách thương hiệu');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const openModal = (brand = null) => {
//         setEditingBrand(brand);
//         setFormData({
//             name: brand?.name || brand?.Name || '',
//             description: brand?.description || brand?.Description || '',
//             isActive: brand?.isActive ?? brand?.IsActive ?? true,
//         });
//         setShowModal(true);
//     };

//     const closeModal = () => {
//         setShowModal(false);
//         setEditingBrand(null);
//         setError('');
//     };

//     const handleSubmit = async (event) => {
//         event.preventDefault();

//         try {
//             if (editingBrand) {
//                 await brandsApi.update(editingBrand.id || editingBrand.Id, formData);
//             } else {
//                 await brandsApi.create(formData);
//             }

//             closeModal();
//             loadBrands();
//         } catch (err) {
//             setError('Không thể lưu thương hiệu');
//         }
//     };

//     const handleDelete = async (id) => {
//         if (!window.confirm('Bạn có chắc muốn xóa thương hiệu này?')) return;

//         try {
//             await brandsApi.delete(id);
//             loadBrands();
//         } catch (err) {
//             alert('Không thể xóa thương hiệu');
//         }
//     };

//     return (
//         <div className="content-wrapper">
//             <section className="content-header">
//                 <div className="container-fluid">
//                     <h1>Quản lý thương hiệu</h1>
//                 </div>
//             </section>

//             <section className="content">
//                 <div className="container-fluid">
//                     <div className="card">
//                         <div className="card-header">
//                             <h3 className="card-title">Danh sách thương hiệu</h3>
//                             <div className="card-tools">
//                                 <button className="btn btn-success" onClick={() => openModal()}>
//                                     <i className="fas fa-plus mr-1"></i>
//                                     Thêm thương hiệu
//                                 </button>
//                             </div>
//                         </div>
//                         <div className="card-body">
//                             {error && <div className="alert alert-danger">{error}</div>}

//                             <table className="table table-bordered table-striped">
//                                 <thead>
//                                     <tr>
//                                         <th>ID</th>
//                                         <th>Tên</th>
//                                         <th>Mô tả</th>
//                                         <th>Trạng thái</th>
//                                         <th>Thao tác</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {loading ? (
//                                         <tr>
//                                             <td colSpan="5" className="text-center">Đang tải...</td>
//                                         </tr>
//                                     ) : brands.length === 0 ? (
//                                         <tr>
//                                             <td colSpan="5" className="text-center">Chưa có thương hiệu</td>
//                                         </tr>
//                                     ) : (
//                                         brands.map((brand) => (
//                                             <tr key={brand.id || brand.Id}>
//                                                 <td>{brand.id || brand.Id}</td>
//                                                 <td>{brand.name || brand.Name}</td>
//                                                 <td>{brand.description || brand.Description}</td>
//                                                 <td>{(brand.isActive ?? brand.IsActive) ? 'Đang hoạt động' : 'Ngừng hoạt động'}</td>
//                                                 <td>
//                                                     <button className="btn btn-sm btn-info mr-1" onClick={() => openModal(brand)}>
//                                                         <i className="fas fa-edit"></i>
//                                                     </button>
//                                                     <button className="btn btn-sm btn-danger" onClick={() => handleDelete(brand.id || brand.Id)}>
//                                                         <i className="fas fa-trash"></i>
//                                                     </button>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {showModal && (
//                 <div className="modal fade show admin-modal" style={{ display: 'block' }} tabIndex="-1">
//                     <div className="modal-dialog">
//                         <div className="modal-content">
//                             <div className="modal-header">
//                                 <h5 className="modal-title">{editingBrand ? 'Sửa thương hiệu' : 'Thêm thương hiệu'}</h5>
//                                 <button type="button" className="close" onClick={closeModal}>
//                                     <span>&times;</span>
//                                 </button>
//                             </div>
//                             <form onSubmit={handleSubmit}>
//                                 <div className="modal-body">
//                                     <div className="form-group">
//                                         <label>Tên thương hiệu</label>
//                                         <input
//                                             className="form-control"
//                                             value={formData.name}
//                                             onChange={(event) => setFormData({ ...formData, name: event.target.value })}
//                                             required
//                                         />
//                                     </div>
//                                     <div className="form-group">
//                                         <label>Mô tả</label>
//                                         <textarea
//                                             className="form-control"
//                                             value={formData.description}
//                                             onChange={(event) => setFormData({ ...formData, description: event.target.value })}
//                                             rows="3"
//                                         />
//                                     </div>
//                                     <div className="form-group">
//                                         <div className="custom-control custom-switch">
//                                             <input
//                                                 id="brandActive"
//                                                 type="checkbox"
//                                                 className="custom-control-input"
//                                                 checked={formData.isActive}
//                                                 onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })}
//                                             />
//                                             <label className="custom-control-label" htmlFor="brandActive">Đang hoạt động</label>
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <div className="modal-footer">
//                                     <button type="button" className="btn btn-secondary" onClick={closeModal}>Hủy</button>
//                                     <button type="submit" className="btn btn-primary">Lưu</button>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>
//                 </div>
//             )}
//             {showModal && <div className="modal-backdrop fade show"></div>}
//         </div>
//     );
// };

// export default Brands;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const Register = () => {
    const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', name: '', email: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setLoading(true);
        try {
            await authApi.register({
                username: form.username,
                password: form.password,
                name: form.name,
                email: form.email,
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page" style={{ minHeight: '100vh' }}>
            <div className="login-box">
                <div className="login-logo">
                    <a href="/">BaseCore Sales</a>
                </div>
                <div className="card">
                    <div className="card-body login-card-body">
                        <p className="login-box-msg">Tạo tài khoản mới</p>

                        {error && (
                            <div className="alert alert-danger alert-dismissible">
                                <button type="button" className="close" onClick={() => setError('')}>&times;</button>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    name="username"
                                    className="form-control"
                                    placeholder="Tên đăng nhập"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="input-group-append">
                                    <div className="input-group-text"><span className="fas fa-user"></span></div>
                                </div>
                            </div>

                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    placeholder="Họ và tên"
                                    value={form.name}
                                    onChange={handleChange}
                                />
                                <div className="input-group-append">
                                    <div className="input-group-text"><span className="fas fa-id-card"></span></div>
                                </div>
                            </div>

                            <div className="input-group mb-3">
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="Email"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                                <div className="input-group-append">
                                    <div className="input-group-text"><span className="fas fa-envelope"></span></div>
                                </div>
                            </div>

                            <div className="input-group mb-3">
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    placeholder="Mật khẩu"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="input-group-append">
                                    <div className="input-group-text"><span className="fas fa-lock"></span></div>
                                </div>
                            </div>

                            <div className="input-group mb-3">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="form-control"
                                    placeholder="Xác nhận mật khẩu"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="input-group-append">
                                    <div className="input-group-text"><span className="fas fa-lock"></span></div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-12">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-block"
                                        disabled={loading}
                                    >
                                        {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Đăng ký'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="mt-3 text-center">
                            <Link to="/login">Đã có tài khoản? Đăng nhập</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

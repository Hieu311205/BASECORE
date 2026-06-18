import React, { useEffect, useState } from 'react';
import { settingsApi } from '../services/api';

const defaultSettings = {
    storeName: 'BaseCore Sales',
    email: '',
    phone: '',
    address: '',
    currency: 'VND',
    taxRate: 0,
    maintenanceMode: false,
};

const Settings = () => {
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await settingsApi.get('store');
            setSettings({ ...defaultSettings, ...(response.data?.value || {}) });
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải cài đặt cửa hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await settingsApi.save('store', {
                ...settings,
                taxRate: Number(settings.taxRate),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể lưu cài đặt cửa hàng');
        }
    };

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Cài đặt cửa hàng</h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Cài đặt chung</h3>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="card-body">
                                {error && <div className="alert alert-danger">{error}</div>}
                                {saved && <div className="alert alert-success">Đã lưu cài đặt cửa hàng.</div>}

                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="form-group">
                                            <label>Tên cửa hàng</label>
                                            <input
                                                className="form-control"
                                                value={settings.storeName}
                                                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={settings.email}
                                                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Điện thoại</label>
                                            <input
                                                className="form-control"
                                                value={settings.phone}
                                                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Địa chỉ</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={settings.address}
                                                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Tiền tệ</label>
                                            <select
                                                className="form-control"
                                                value={settings.currency}
                                                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                            >
                                                <option value="VND">VND</option>
                                                <option value="USD">USD</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Thuế (%)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                min="0"
                                                value={settings.taxRate}
                                                onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <div className="custom-control custom-switch">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id="maintenanceMode"
                                                    checked={settings.maintenanceMode}
                                                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                                />
                                                <label className="custom-control-label" htmlFor="maintenanceMode">Chế độ bảo trì</label>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="card-footer">
                                <button type="submit" className="btn btn-primary" disabled={loading}>Lưu cài đặt</button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Settings;

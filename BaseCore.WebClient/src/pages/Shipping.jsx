import React, { useEffect, useState } from 'react';
import { settingsApi } from '../services/api';

const defaultSettings = {
    defaultFee: 30000,
    freeShippingThreshold: 1000000,
    deliveryProvider: 'Giao hàng nội bộ',
    trackingUrlTemplate: '',
    enabled: true,
};

const Shipping = () => {
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
            const response = await settingsApi.get('shipping');
            setSettings({ ...defaultSettings, ...(response.data?.value || {}) });
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải cài đặt vận chuyển');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await settingsApi.save('shipping', {
                ...settings,
                defaultFee: Number(settings.defaultFee),
                freeShippingThreshold: Number(settings.freeShippingThreshold),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể lưu cài đặt vận chuyển');
        }
    };

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Vận chuyển</h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Cài đặt giao hàng</h3>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="card-body">
                                {error && <div className="alert alert-danger">{error}</div>}
                                {saved && <div className="alert alert-success">Đã lưu cài đặt vận chuyển.</div>}

                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="form-group">
                                            <label>Phí vận chuyển mặc định (VND)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                min="0"
                                                value={settings.defaultFee}
                                                onChange={(e) => setSettings({ ...settings, defaultFee: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Ngưỡng miễn phí vận chuyển (VND)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                min="0"
                                                value={settings.freeShippingThreshold}
                                                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Đơn vị vận chuyển</label>
                                            <input
                                                className="form-control"
                                                value={settings.deliveryProvider}
                                                onChange={(e) => setSettings({ ...settings, deliveryProvider: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Mẫu URL theo dõi đơn</label>
                                            <input
                                                className="form-control"
                                                placeholder="https://carrier.example/track/{trackingNumber}"
                                                value={settings.trackingUrlTemplate}
                                                onChange={(e) => setSettings({ ...settings, trackingUrlTemplate: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <div className="custom-control custom-switch">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id="shippingEnabled"
                                                    checked={settings.enabled}
                                                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                                                />
                                                <label className="custom-control-label" htmlFor="shippingEnabled">Bật vận chuyển</label>
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

export default Shipping;

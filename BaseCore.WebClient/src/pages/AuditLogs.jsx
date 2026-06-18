import React, { useEffect, useState } from 'react';
import { auditLogApi } from '../services/api';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await auditLogApi.getAll();
            setLogs(Array.isArray(response.data) ? response.data : response.data?.data || []);
        } catch (err) {
            setLogs([]);
            setError('Chưa có phiên bản cập nhật mới');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Nhật ký hệ thống</h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Nhật ký hoạt động</h3>
                            <div className="card-tools">
                                <button className="btn btn-sm btn-primary" onClick={loadLogs}>
                                    <i className="fas fa-sync-alt"></i> Tải lại
                                </button>
                            </div>
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-warning">{error}</div>}

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
                                                <th>Tiêu đề</th>
                                                <th>Thông điệp</th>
                                                <th>Nội dung</th>
                                                <th>Ngày tạo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="text-center">Không tìm thấy nhật ký hệ thống</td>
                                                </tr>
                                            ) : (
                                                logs.map((log) => (
                                                    <tr key={log.id}>
                                                        <td>{log.id}</td>
                                                        <td>{log.header || 'Không có'}</td>
                                                        <td>{log.message || 'Không có'}</td>
                                                        <td>{log.body || 'Không có'}</td>
                                                        <td>{log.createdDateTime || 'Không có'}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AuditLogs;

import React, { useState } from 'react';

const Contact = () => {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    return (
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '60px' }}>
            <div className="text-center mb-5">
                <h2>Liên Hệ</h2>
                <span className="text-muted">Chúng tôi luôn sẵn sàng lắng nghe bạn</span>
            </div>

            <div className="row">
                <div className="col-md-5 mb-4">
                    <h5 className="mb-3">Thông tin liên hệ</h5>
                    <ul className="list-unstyled text-muted">
                        <li className="mb-3">
                            <i className="fas fa-map-marker-alt text-primary mr-2"></i>
                            123 Đường Hoa Hồng, Quận 1, TP. Hồ Chí Minh
                        </li>
                        <li className="mb-3">
                            <i className="fas fa-phone text-primary mr-2"></i>
                            0900 123 456
                        </li>
                        <li className="mb-3">
                            <i className="fas fa-envelope text-primary mr-2"></i>
                            contact@lumiere.vn
                        </li>
                        <li className="mb-3">
                            <i className="fas fa-clock text-primary mr-2"></i>
                            Thứ 2 - Thứ 7: 8:00 - 18:00
                        </li>
                    </ul>
                </div>

                <div className="col-md-7">
                    {sent ? (
                        <div className="text-center py-5">
                            <i className="fas fa-check-circle fa-4x text-success mb-3"></i>
                            <h5>Cảm ơn bạn đã liên hệ!</h5>
                            <p className="text-muted">Chúng tôi sẽ phản hồi trong vòng 24 giờ.</p>
                            <button className="btn btn-outline-primary mt-2" onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}>
                                Gửi tin nhắn khác
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    placeholder="Nguyễn Văn A"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="example@email.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Nội dung</label>
                                <textarea
                                    name="message"
                                    className="form-control"
                                    rows="5"
                                    placeholder="Nội dung tin nhắn..."
                                    value={form.message}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-block">
                                <i className="fas fa-paper-plane mr-2"></i>Gửi tin nhắn
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contact;

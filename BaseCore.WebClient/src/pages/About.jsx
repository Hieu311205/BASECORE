import React from 'react';
import { Link } from 'react-router-dom';

const About = () => (
    <div className="container" style={{ paddingTop: '80px', paddingBottom: '60px' }}>
        <div className="text-center mb-5">
            <h2>Về Chúng Tôi</h2>
            <span className="text-muted">Câu chuyện của Lumière</span>
        </div>

        <div className="row align-items-center mb-5">
            <div className="col-md-6 mb-4">
                <h4>Chúng tôi là ai?</h4>
                <p className="text-muted">
                    Lumière được thành lập với sứ mệnh mang đến những mùi hương đẳng cấp,
                    tinh tế và độc đáo cho người yêu nước hoa tại Việt Nam. Mỗi chai nước hoa
                    là một tác phẩm nghệ thuật — từ công thức hương liệu đến thiết kế bao bì.
                </p>
                <p className="text-muted">
                    Chúng tôi hợp tác trực tiếp với các nhà sản xuất hương liệu hàng đầu
                    tại Pháp để đảm bảo chất lượng tốt nhất cho từng sản phẩm.
                </p>
            </div>
            <div className="col-md-6 text-center">
                <div className="bg-light rounded p-5">
                    <i className="fas fa-spray-can fa-5x text-primary mb-3"></i>
                    <h5>Thành lập từ 2020</h5>
                </div>
            </div>
        </div>

        <div className="row text-center mb-5">
            <div className="col-md-4 mb-4">
                <div className="card border-0 shadow-sm h-100 p-4">
                    <i className="fas fa-award fa-3x text-warning mb-3"></i>
                    <h5>Chất lượng cao</h5>
                    <p className="text-muted small">100% nguyên liệu nhập khẩu từ châu Âu</p>
                </div>
            </div>
            <div className="col-md-4 mb-4">
                <div className="card border-0 shadow-sm h-100 p-4">
                    <i className="fas fa-shipping-fast fa-3x text-primary mb-3"></i>
                    <h5>Giao hàng nhanh</h5>
                    <p className="text-muted small">Giao hàng toàn quốc trong 2-3 ngày</p>
                </div>
            </div>
            <div className="col-md-4 mb-4">
                <div className="card border-0 shadow-sm h-100 p-4">
                    <i className="fas fa-undo fa-3x text-success mb-3"></i>
                    <h5>Đổi trả dễ dàng</h5>
                    <p className="text-muted small">Hoàn tiền 100% trong 7 ngày nếu không hài lòng</p>
                </div>
            </div>
        </div>

        <div className="text-center">
            <Link to="/products" className="btn btn-primary btn-lg">
                Khám phá sản phẩm
            </Link>
        </div>
    </div>
);

export default About;

import { useState, useEffect } from 'react';
import axios from 'axios';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Gọi API đến Backend ASP.NET Core (cổng 5000)
        // Proxy trong vite.config.js sẽ tự hiểu /api/Product là http://localhost:5000/api/Product
        axios.get('/api/Product')
            .then(response => {
                setProducts(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Lỗi khi lấy danh sách sản phẩm:", error);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-center">Đang tải sản phẩm...</div>;

    return (
        <section className="section" id="products">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="section-heading">
                            <h2>Sản Phẩm Của Chúng Tôi</h2>
                            <span>Khám phá những mùi hương đẳng cấp nhất.</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container">
                <div className="row">
                    {products.map((item) => (
                        <div className="col-lg-4" key={item.id}>
                            <div className="item">
                                <div className="thumb">
                                    <div className="hover-content">
                                        <ul>
                                            <li><a href={`/product/${item.id}`}><i className="fa fa-eye"></i></a></li>
                                            <li><a href="#"><i className="fa fa-shopping-cart"></i></a></li>
                                        </ul>
                                    </div>
                                    {/* Đường dẫn ảnh khớp với thư mục public/assets/images/ */}
                                    <img src={`/assets/images/${item.imageUrl}`} alt={item.name} />
                                </div>
                                <div className="down-content">
                                    <h4>{item.name}</h4>
                                    <span>{item.price?.toLocaleString()} VNĐ</span>
                                    <ul className="stars">
                                        <li><i className="fa fa-star"></i></li>
                                        <li><i className="fa fa-star"></i></li>
                                        <li><i className="fa fa-star"></i></li>
                                        <li><i className="fa fa-star"></i></li>
                                        <li><i className="fa fa-star"></i></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductList;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Gọi API lấy sản phẩm từ Backend
        axios.get('/api/Product')
            .then(res => setProducts(res.data))
            .catch(err => console.error("Lỗi lấy data:", err));
    }, []);

    return (
        <div className="container">
            <div className="section-heading text-center">
                <h2>Sản Phẩm Mới Nhất</h2>
                <span>Mùi hương đẳng cấp từ Lumière</span>
            </div>
            <div className="row">
                {products.map(p => (
                    <div className="col-lg-4" key={p.id}>
                        <div className="item">
                            <img src={`/assets/images/${p.imageUrl}`} alt={p.name} style={{width: '100%'}} />
                            <h4>{p.name}</h4>
                            <span>{p.price?.toLocaleString()} VNĐ</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
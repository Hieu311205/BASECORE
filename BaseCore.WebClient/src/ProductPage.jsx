import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Gọi API từ Backend của bạn
    axios.get('/api/Products')
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <section className="section" id="products">
      <div className="container">
        <div className="row">
          {products.map(p => (
            <div className="col-lg-4" key={p.id}>
              <div className="item">
                <div className="thumb">
                  <img src={`/assets/images/${p.imageUrl}`} alt={p.name} />
                </div>
                <div className="down-content">
                  <h4>{p.name}</h4>
                  <span>{p.price.toLocaleString()} VNĐ</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default ProductPage;
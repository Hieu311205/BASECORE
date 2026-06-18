async function loadProductDetail() {
    const container = document.getElementById("product-detail");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) {
        container.innerHTML = "<p>Không tìm thấy mã sản phẩm.</p>";
        return;
    }

    let product = null;
    try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (response.ok) {
            product = await response.json();
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.warn("API không trả về dữ liệu, dùng fallback mẫu.", error);
        // Fallback dữ liệu mẫu (để trang không bị lỗi khi chưa có API)
        const FALLBACK = [
            { id: 1, name: "Woody Oud", categoryId: 8, price: 2850000, imageUrl: "perfume-1.jpg", description: "Hương gỗ quý tộc, lưu hương lâu.", brand: "Lumière", volume: "100ml", usage: "Xịt lên cổ tay, sau tai." },
            { id: 2, name: "Floral Bloom", categoryId: 9, price: 2450000, imageUrl: "perfume-2.jpg", description: "Hương hoa nhẹ nhàng, thanh khiết." },
            { id: 3, name: "Ocean Breeze", categoryId: 10, price: 2100000, imageUrl: "perfume-3.jpg", description: "Hương biển tươi mát." },
            { id: 4, name: "Luxury Gift Set", categoryId: 11, price: 890000, imageUrl: "gift-set.jpg", description: "Set quà tặng sang trọng." }
        ];
        product = FALLBACK.find(p => p.id == id);
    }

    if (!product) {
        container.innerHTML = "<p>Sản phẩm không tồn tại.</p>";
        return;
    }

    // Chuẩn hóa tên trường (có thể từ API trả về camelCase hoặc PascalCase)
    const name = escapeHtml(product.name || product.Name);
    const categoryId = product.categoryId || product.CategoryId;
    const categoryName = getCategoryName(categoryId);
    const description = escapeHtml(product.description || product.Description || "Chưa có mô tả.");
    const price = Number(product.price || product.Price);
    const imageUrl = getImageUrl(product.imageUrl || product.ImageUrl);
    const stock = product.stock || product.Stock || 10;
    const brand = product.brand || product.Brand || "Lumière";
    const volume = product.volume || product.Volume || "100ml";
    const usage = product.usage || product.Usage || "Xịt lên vùng da mạch máu như cổ tay, sau tai.";

    container.innerHTML = `
        <div class="row">
            <div class="col-lg-6 mb-4">
                <div class="left-images">
                    <img src="${imageUrl}" alt="${name}" style="width:100%; border-radius:12px;">
                </div>
            </div>
            <div class="col-lg-6 mb-4">
                <div class="right-content dark-panel">
                    <h4>${name}</h4>
                    <span class="price"><h6>${formatPrice(price)}</h6></span>
                    <div style="margin-bottom:10px; color:#d5a24f; font-weight:600;">${categoryName}</div>
                    <div><strong>Thương hiệu:</strong> ${escapeHtml(brand)}</div>
                    <div><strong>Dung tích:</strong> ${escapeHtml(volume)}</div>
                    <div style="margin: 20px 0; padding: 12px; background: #0f0f0f; border-left: 4px solid #d4af37; border-radius: 8px;">
                        <h5 style="color:#d4af37; margin-bottom: 8px;">📖 Mô tả</h5>
                        <p style="margin:0; line-height:1.5;">${description}</p>
                    </div>
                    <div><strong>Hướng dẫn sử dụng:</strong> ${escapeHtml(usage)}</div>
                    <div class="quantity-content" style="margin-top:25px;">
                        <div class="left-content"><h6>Số lượng</h6></div>
                        <div class="right-content">
                            <div class="quantity buttons_added">
                                <input type="button" value="-" class="minus" onclick="changeQty(-1)">
                                <input type="number" step="1" min="1" id="product-qty" value="1" class="input-text qty text" size="4">
                                <input type="button" value="+" class="plus" onclick="changeQty(1)">
                            </div>
                        </div>
                    </div>
                    <div style="margin-top:15px;"><strong>Tồn kho:</strong> ${stock}</div>
                    <div class="total" style="margin-top:25px;">
                        <h4 id="product-total">Tổng: ${formatPrice(price)}</h4>
                        <div class="main-border-button">
                            <a href="javascript:void(0)" onclick="handleAddToCart(${product.id || product.ProductID}, '${jsSafe(name)}', ${price}, '${imageUrl}')">
                                Thêm vào giỏ hàng
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    window.currentProductPrice = price;
}

// Helper functions (cần có để dùng)
function formatPrice(price) {
    return Number(price).toLocaleString("vi-VN") + "đ";
}

function getImageUrl(url) {
    if (!url) return "assets/images/default.jpg";
    if (url.startsWith("http")) return url;
    return "assets/images/" + url;
}

function escapeHtml(text) {
    if (!text) return "";
    return String(text).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function getCategoryName(categoryId) {
    const id = Number(categoryId);
    if (id === 8) return "Nước hoa nam";
    if (id === 9) return "Nước hoa nữ";
    if (id === 10) return "Nước hoa unisex";
    if (id === 11) return "Gift set";
    return "Lumière Perfume";
}

function changeQty(delta) {
    const qtyInput = document.getElementById("product-qty");
    if (!qtyInput) return;
    let qty = Number(qtyInput.value) || 1;
    qty += delta;
    if (qty < 1) qty = 1;
    qtyInput.value = qty;
    updateTotal();
}

function updateTotal() {
    const qtyInput = document.getElementById("product-qty");
    const totalEl = document.getElementById("product-total");
    if (!qtyInput || !totalEl) return;
    const qty = Number(qtyInput.value) || 1;
    const total = qty * (window.currentProductPrice || 0);
    totalEl.textContent = `Tổng: ${formatPrice(total)}`;
}

function handleAddToCart(id, name, price, imageUrl) {
    const qtyInput = document.getElementById("product-qty");
    const quantity = qtyInput ? Number(qtyInput.value) : 1;
    if (typeof addToCart === "function") {
        addToCart(id, name, price, imageUrl, quantity);
    } else {
        alert("Hàm thêm giỏ hàng chưa sẵn sàng.");
    }
}

function jsSafe(text) {
    return String(text).replace(/'/g, "\\'");
}

// Khởi chạy
document.addEventListener("DOMContentLoaded", loadProductDetail);

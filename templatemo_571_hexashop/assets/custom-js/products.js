// Dùng window.API_BASE_URL được set bởi api.js (không khai báo lại để tránh xung đột)
let allProducts = [];
function formatPrice(price) {
    // Chuyển giá từ number/string sang định dạng tiền Việt Nam.
    const value = Number(price || 0);
    return value.toLocaleString("vi-VN") + "đ";
}

function getImageUrl(imageUrl) {
    // Dùng ảnh mặc định nếu API không trả ảnh; URL tuyệt đối và assets local được giữ nguyên.
    if (!imageUrl) return "assets/images/default.jpg";
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("assets/")) return imageUrl;
    return "assets/images/" + imageUrl;
}

function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
}

function getProductId(product) {
    // Hỗ trợ nhiều kiểu tên field vì dữ liệu có thể đến từ API khác nhau.
    return product.ProductID || product.productID || product.productId || product.Id || product.id;
}

function getProductName(product) {
    // Lấy tên sản phẩm theo cả PascalCase và camelCase.
    return product.Name || product.name || "";
}

function getProductPrice(product) {
    // Lấy giá sản phẩm theo cả PascalCase và camelCase.
    return product.Price || product.price || 0;
}

function getProductPriceNumber(product) {
    // Chuyển giá về number để lọc theo khoảng giá.
    const rawPrice = getProductPrice(product);

    if (typeof rawPrice === "number") {
        return rawPrice;
    }

    return Number(String(rawPrice || "0").replace(/[^\d.-]/g, ""));
}

function getInputPriceNumber(input) {
    // Input rỗng nghĩa là không áp dụng giới hạn min/max.
    if (!input || input.value.trim() === "") {
        return null;
    }

    const value = Number(input.value);
    return Number.isNaN(value) ? null : value;
}

function getProductImage(product) {
    // Lấy ảnh sản phẩm từ các tên field phổ biến.
    return product.ImageUrl || product.imageUrl || product.image || product.Image || "";
}

function getProductCategoryId(product) {
    return product.CategoryId || product.categoryId || product.CategoryID || product.categoryID;
}

function getProductDescription(product) {
    return product.Description || product.description || "";
}

function getCategoryName(categoryId) {
    // Map category mẫu của shop nước hoa sang tên hiển thị thân thiện.
    const id = Number(categoryId);

    if (id === 8) return "Nước hoa nam";
    if (id === 9) return "Nước hoa nữ";
    if (id === 10) return "Nước hoa unisex";
    if (id === 11) return "Gift set";

    return "Lumière Perfume";
}

function normalizeProducts(data) {
    // API có thể trả array trực tiếp hoặc bọc trong data/items/products/result/$values.
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.products)) return data.products;
    if (Array.isArray(data.result)) return data.result;
    if (Array.isArray(data.$values)) return data.$values;

    return [];
}

function attachCardClickEvents() {
    // Gắn click vào card để mở trang chi tiết, tránh bind lặp bằng dataset.clickBound.
    document.querySelectorAll(".product-card").forEach(card => {
        if (card.dataset.clickBound) return;

        card.dataset.clickBound = "true";

        card.addEventListener("click", function (e) {
            // Không chuyển trang nếu click vào nút thêm giỏ hàng hoặc link con.
            if (e.target.closest(".add-to-cart-btn")) return;
            if (e.target.closest("a")) return;

            const id = this.dataset.id;
            if (id) {
                window.location.href = `single-product.html?id=${id}`;
            }
        });
    });
}

function getProductHtml(product) {
    const id = getProductId(product);
    const name = getProductName(product);
    const price = getProductPrice(product);
    const imageUrl = getImageUrl(getProductImage(product));
    const categoryId = getProductCategoryId(product);
    const catName = getCategoryName(categoryId);
    const description = getProductDescription(product);

    return `
        <div class="product-card"
             data-id="${id}"
             data-name="${escapeHtml(name)}"
             data-price="${price}"
             data-image="${imageUrl}">

            <div class="product-thumb">
                <img src="${imageUrl}" alt="${escapeHtml(name)}" loading="lazy"
                     onerror="this.src='assets/images/default.jpg'">
                <div class="product-overlay">
                    <a class="overlay-btn" href="single-product.html?id=${id}" title="Xem chi tiết">
                        <i class="fa fa-eye"></i>
                    </a>
                    <button class="overlay-btn add-to-cart-btn" type="button" title="Thêm vào giỏ">
                        <i class="fa fa-shopping-cart"></i>
                    </button>
                </div>
                <span class="product-badge-cat">${escapeHtml(catName)}</span>
            </div>

            <div class="product-content">
                <div class="product-name">${escapeHtml(name)}</div>
                ${description ? `<div class="product-desc">${escapeHtml(description)}</div>` : ""}
                <div class="product-footer">
                    <div class="product-price">${formatPrice(price)}</div>
                    <div class="product-stars">
                        <i class="fa fa-star"></i>
                        <i class="fa fa-star"></i>
                        <i class="fa fa-star"></i>
                        <i class="fa fa-star"></i>
                        <i class="fa fa-star-o"></i>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function bindAddToCartButtons(container = document) {
    // Bind nút thêm giỏ hàng trong container, tránh bind nhiều lần bằng dataset.bound.
    container.querySelectorAll(".add-to-cart-btn").forEach(btn => {
        if (btn.dataset.bound) return;

        btn.dataset.bound = "true";

        btn.addEventListener("click", function (e) {
            // Chặn click nổi lên card để không mở trang chi tiết khi thêm giỏ.
            e.stopPropagation();

            const card = btn.closest(".product-card");
            if (!card) return;

            const id = card.dataset.id;
            const name = card.dataset.name;
            const price = Number(card.dataset.price);
            const imageUrl = card.dataset.image;

            if (!id || !name || isNaN(price)) {
                // Dữ liệu thiếu id/name/price thì không thêm vào giỏ để tránh lỗi downstream.
                alert("Dữ liệu sản phẩm không hợp lệ.");
                return;
            }

            if (typeof addToCart === "function") {
                // Hàm addToCart nằm ở file cart.js dùng chung cho template.
                addToCart(id, name, price, imageUrl, 1);
            } else {
                alert("Hàm addToCart chưa được định nghĩa.");
            }
        });
    });
}

function renderProducts(products) {
    // Render danh sách sản phẩm vào trang products.html.
    const productList = document.getElementById("product-list");
    if (!productList) return;

    products = Array.isArray(products) ? products : [];

    if (products.length === 0) {
        productList.innerHTML = `<div class="empty-state"><i class="fa fa-search"></i><p>Không có sản phẩm phù hợp.</p></div>`;
        return;
    }

    productList.innerHTML = products.map(product => getProductHtml(product)).join("");

    bindAddToCartButtons(productList);
    attachCardClickEvents();
}

function renderProductsToContainer(products, container) {
    // Render sản phẩm vào container tùy chọn, ví dụ danh sách nổi bật ở trang chủ.
    if (!container) return;

    products = Array.isArray(products) ? products : [];

    if (products.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fa fa-shopping-bag"></i><p>Chưa có sản phẩm.</p></div>`;
        return;
    }

    container.innerHTML = products.map(product => getProductHtml(product)).join("");

    bindAddToCartButtons(container);
    attachCardClickEvents();
}

function applyFilterAndRender(categoryIdParam = null) {
    // Lấy các control filter hiện có trên trang.
    const categoryFilter = document.getElementById("filter-category");
    const keywordFilter = document.getElementById("filter-keyword");
    const minPriceInput = document.getElementById("filter-price-min");
    const maxPriceInput = document.getElementById("filter-price-max");

    // Copy danh sách gốc để filter không làm thay đổi allProducts.
    let filtered = Array.isArray(allProducts) ? [...allProducts] : [];

    const categoryId = categoryIdParam || (categoryFilter ? categoryFilter.value : "");
    const keyword = keywordFilter ? keywordFilter.value.toLowerCase().trim() : "";
    const minPrice = getInputPriceNumber(minPriceInput);
    const maxPrice = getInputPriceNumber(maxPriceInput);

    if (categoryId) {
        // Lọc theo category từ select hoặc query string categoryId.
        filtered = filtered.filter(p => Number(getProductCategoryId(p)) === Number(categoryId));
    }

    if (keyword) {
        // Tìm theo tên sản phẩm không phân biệt hoa/thường.
        filtered = filtered.filter(p =>
            getProductName(p).toLowerCase().includes(keyword)
        );
    }

    if (minPrice !== null) {
        // Lọc giá thấp nhất nếu người dùng nhập min.
        filtered = filtered.filter(p => getProductPriceNumber(p) >= minPrice);
    }

    if (maxPrice !== null) {
        filtered = filtered.filter(p => getProductPriceNumber(p) <= maxPrice);
    }

    const sortSelect = document.getElementById("filter-sort");
    const sortValue = sortSelect ? sortSelect.value : "";

    if (sortValue === "price-asc") {
        filtered.sort((a, b) => getProductPriceNumber(a) - getProductPriceNumber(b));
    } else if (sortValue === "price-desc") {
        filtered.sort((a, b) => getProductPriceNumber(b) - getProductPriceNumber(a));
    } else if (sortValue === "name-asc") {
        filtered.sort((a, b) => getProductName(a).localeCompare(getProductName(b), "vi"));
    }

    renderProducts(filtered);
}

function getSkeletonHtml(count) {
    const n = count || 8;
    let html = '';
    for (let i = 0; i < n; i++) {
        html += `<div class="skeleton-card">
            <div class="skeleton-thumb"></div>
            <div class="skeleton-body">
                <div class="skeleton-line s-80"></div>
                <div class="skeleton-line s-60 s-short"></div>
                <div class="skeleton-line s-40 s-short"></div>
            </div>
        </div>`;
    }
    return html;
}

// ── Autocomplete suggestions ──────────────────────────────────────────────────

function highlightMatch(text, keyword) {
    if (!keyword || !text) return escapeHtml(text || "");
    const lower = text.toLowerCase();
    const kwLower = keyword.toLowerCase();
    let result = "";
    let lastIndex = 0;
    let idx;
    while ((idx = lower.indexOf(kwLower, lastIndex)) !== -1) {
        result += escapeHtml(text.slice(lastIndex, idx));
        result += `<mark>${escapeHtml(text.slice(idx, idx + kwLower.length))}</mark>`;
        lastIndex = idx + kwLower.length;
    }
    result += escapeHtml(text.slice(lastIndex));
    return result;
}

function hideSuggestions() {
    const el = document.getElementById("search-suggestions");
    if (el) { el.innerHTML = ""; el.classList.remove("show"); }
}

function buildSuggestions(keyword) {
    const suggestionsEl = document.getElementById("search-suggestions");
    if (!suggestionsEl) return;

    const kw = keyword.trim().toLowerCase();
    if (!kw) { hideSuggestions(); return; }

    const matches = (Array.isArray(allProducts) ? allProducts : [])
        .filter(p => getProductName(p).toLowerCase().includes(kw))
        .slice(0, 8);

    if (matches.length === 0) {
        suggestionsEl.innerHTML = `<div class="suggest-empty"><i class="fa fa-search"></i> Không tìm thấy kết quả</div>`;
        suggestionsEl.classList.add("show");
        return;
    }

    suggestionsEl.innerHTML = matches.map(p => {
        const name = getProductName(p);
        return `<div class="suggest-item" data-label="${escapeHtml(name)}">
            <i class="fa fa-search"></i>
            <span>${highlightMatch(name, kw)}</span>
        </div>`;
    }).join("");

    suggestionsEl.classList.add("show");

    suggestionsEl.querySelectorAll(".suggest-item").forEach(item => {
        item.addEventListener("mousedown", function (e) {
            e.preventDefault();
            const keywordInput = document.getElementById("filter-keyword");
            if (keywordInput) keywordInput.value = this.dataset.label;
            hideSuggestions();
            applyFilterAndRender();
        });
    });
}

function initSearchSuggestions() {
    const keywordInput = document.getElementById("filter-keyword");
    if (!keywordInput) return;

    keywordInput.addEventListener("input", function () {
        buildSuggestions(this.value);
    });

    keywordInput.addEventListener("focus", function () {
        if (this.value.trim()) buildSuggestions(this.value);
    });

    keywordInput.addEventListener("keydown", function (e) {
        const el = document.getElementById("search-suggestions");
        if (!el || !el.classList.contains("show")) return;

        const items = el.querySelectorAll(".suggest-item[data-type]");
        let active  = el.querySelector(".suggest-item.active");
        let idx     = Array.from(items).indexOf(active);

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (active) active.classList.remove("active");
            idx = (idx + 1) % items.length;
            items[idx].classList.add("active");
            items[idx].scrollIntoView({ block: "nearest" });
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (active) active.classList.remove("active");
            idx = (idx - 1 + items.length) % items.length;
            items[idx].classList.add("active");
            items[idx].scrollIntoView({ block: "nearest" });
        } else if (e.key === "Enter") {
            if (active) {
                e.preventDefault();
                active.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
            } else {
                hideSuggestions();
                applyFilterAndRender();
            }
        } else if (e.key === "Escape") {
            hideSuggestions();
        }
    });

    document.addEventListener("click", function (e) {
        if (!e.target.closest(".search-wrapper")) hideSuggestions();
    });
}

// ─────────────────────────────────────────────────────────────────────────────

async function loadProductsFromAPI() {
    const productList = document.getElementById("product-list");
    const homeProductList = document.getElementById("home-product-list");

    if (productList) productList.innerHTML = getSkeletonHtml(9);
    if (homeProductList) homeProductList.innerHTML = getSkeletonHtml(4);

    try {
        const fetchUrl = `${window.API_BASE_URL}/products?page=1&pageSize=100`;
        console.log("[products.js] Đang gọi:", fetchUrl);
        const response = await fetch(fetchUrl);
        console.log("[products.js] Response status:", response.status);

        if (!response.ok) {
            throw new Error(`API trả về lỗi: ${response.status}`);
        }

        const data = await response.json();

        if (!data || (typeof data !== "object")) {
            throw new Error("Dữ liệu API không hợp lệ");
        }

        allProducts = normalizeProducts(data);
        console.log("[products.js] Số sản phẩm nhận được:", allProducts.length, "| data keys:", Object.keys(data));

        if (!Array.isArray(allProducts) || allProducts.length === 0) {
            const emptyHtml = `<div class="empty-state"><i class="fa fa-shopping-bag"></i><p>Không có sản phẩm nào.</p></div>`;
            if (productList) productList.innerHTML = emptyHtml;
            if (homeProductList) homeProductList.innerHTML = emptyHtml;
            return;
        }

        if (productList) renderProducts(allProducts);
        if (homeProductList) renderProductsToContainer(allProducts.slice(0, 6), homeProductList);

    } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        const url = `${window.API_BASE_URL}/products?page=1&pageSize=100`;
        const isNetworkErr = error instanceof TypeError && error.message.includes("fetch");
        const hint = isNetworkErr
            ? "Không thể kết nối tới máy chủ. Hãy đảm bảo ApiGateway (port 5000) và APIService (port 5001) đang chạy."
            : `Lỗi: ${error.message}`;
        const errorHtml = `
            <div class="empty-state">
                <i class="fa fa-exclamation-triangle" style="color:#d4af37;"></i>
                <p style="color:#aaa;margin-top:12px;">${hint}</p>
                <p style="font-size:12px;color:#555;margin-top:4px;">URL: ${url}</p>
                <button onclick="location.reload()" style="margin-top:14px;padding:8px 24px;background:#d4af37;color:#000;border:none;border-radius:4px;cursor:pointer;font-weight:600;">Thử lại</button>
            </div>`;
        if (productList) productList.innerHTML = errorHtml;
        if (homeProductList) homeProductList.innerHTML = errorHtml;
    }
}

(async function initProducts() {
    // Nếu DOM chưa sẵn sàng thì đợi, nếu đã sẵn sàng thì chạy ngay.
    // Script nằm cuối body nên document.readyState thường là "interactive" hoặc "complete".
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () { initProducts(); });
        return;
    }

    await loadProductsFromAPI();

    const params = new URLSearchParams(window.location.search);
    const categoryIdFromUrl = params.get("categoryId");

    const categorySelect = document.getElementById("filter-category");
    const keywordInput = document.getElementById("filter-keyword");
    const minPriceInput = document.getElementById("filter-price-min");
    const maxPriceInput = document.getElementById("filter-price-max");
    const searchBtn = document.getElementById("search-btn");

    if (categoryIdFromUrl) {
        if (categorySelect) categorySelect.value = categoryIdFromUrl;
        applyFilterAndRender(categoryIdFromUrl);
    }

    if (searchBtn) {
        searchBtn.addEventListener("click", function () { applyFilterAndRender(); });
    }

    if (categorySelect) {
        categorySelect.addEventListener("change", function () { applyFilterAndRender(); });
    }

    const sortSelect = document.getElementById("filter-sort");
    if (sortSelect) {
        sortSelect.addEventListener("change", function () { applyFilterAndRender(); });
    }

    if (minPriceInput) {
        minPriceInput.addEventListener("change", function () { applyFilterAndRender(); });
        minPriceInput.addEventListener("keyup", function (e) { if (e.key === "Enter") applyFilterAndRender(); });
    }

    if (maxPriceInput) {
        maxPriceInput.addEventListener("change", function () { applyFilterAndRender(); });
        maxPriceInput.addEventListener("keyup", function (e) { if (e.key === "Enter") applyFilterAndRender(); });
    }

    // Keyup Enter cho keyword (keydown Arrow/Enter được xử lý bên trong initSearchSuggestions)
    if (keywordInput) {
        keywordInput.addEventListener("keyup", function (e) {
            if (e.key === "Enter") { hideSuggestions(); applyFilterAndRender(); }
        });
    }

    // Khởi động autocomplete sau khi allProducts đã có dữ liệu
    initSearchSuggestions();

    document.querySelectorAll(".filter-cat-link").forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const catId = this.getAttribute("data-category-id");
            window.location.href = catId ? `products.html?categoryId=${catId}` : "products.html";
        });
    });
})();

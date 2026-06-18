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
    // Escape ký tự nguy hiểm trước khi render string vào HTML.
    if (!text) return "";
    return String(text).replace(/[&<>]/g, function (m) {
        if (m === "&") return "&amp;";
        if (m === "<") return "&lt;";
        if (m === ">") return "&gt;";
        return m;
    });
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
    // Lấy category id từ dữ liệu API dù field viết theo kiểu nào.
    return product.CategoryId || product.categoryId || product.CategoryID || product.categoryID;
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
    // Tạo HTML cho một card sản phẩm từ dữ liệu đã normalize.
    const id = getProductId(product);
    const name = getProductName(product);
    const price = getProductPrice(product);
    const imageUrl = getImageUrl(getProductImage(product));
    const categoryId = getProductCategoryId(product);

    return `
        <div class="product-card"
             data-id="${id}"
             data-name="${escapeHtml(name)}"
             data-price="${price}"
             data-image="${imageUrl}">
             
            <div class="product-image" style="background-image:url('${imageUrl}')"></div>

            <div class="product-content">
                <div class="product-brand">${getCategoryName(categoryId)}</div>
                <div class="product-name">${escapeHtml(name)}</div>
                <div class="product-price">${formatPrice(price)}</div>

                <div class="product-actions">
                    <a class="product-action" href="single-product.html?id=${id}">
                        <i class="fa fa-info-circle"></i> Chi tiết
                    </a>

                    <button class="product-action add-to-cart-btn" type="button">
                        <i class="fa fa-shopping-cart"></i> Thêm
                    </button>
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
        // Hiển thị empty state khi filter không còn sản phẩm phù hợp.
        productList.innerHTML = "<p>Không có sản phẩm phù hợp.</p>";
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
        container.innerHTML = "<p>Chưa có sản phẩm.</p>";
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
        // Lọc giá cao nhất nếu người dùng nhập max.
        filtered = filtered.filter(p => getProductPriceNumber(p) <= maxPrice);
    }

    renderProducts(filtered);
}

async function loadProductsFromAPI() {
    try {
        // Gọi API gateway để lấy tối đa 100 sản phẩm cho trang bán hàng.
        const response = await fetch("http://localhost:5000/api/products?page=1&pageSize=100");

        if (!response.ok) {
            throw new Error("Không gọi được API products");
        }

        const data = await response.json();

        console.log("DATA PRODUCTS:", data);

        // Chuẩn hóa response rồi lưu vào biến global để filter phía client.
        allProducts = normalizeProducts(data);

        console.log("ALL PRODUCTS ARRAY:", allProducts);

        const productList = document.getElementById("product-list");
        const homeProductList = document.getElementById("home-product-list");

        if (productList) {
            // Trang products.html render toàn bộ danh sách.
            renderProducts(allProducts);
        }

        if (homeProductList) {
            // Trang chủ chỉ lấy 6 sản phẩm đầu làm danh sách nổi bật.
            renderProductsToContainer(allProducts.slice(0, 6), homeProductList);
        }

    } catch (error) {
        // Khi API lỗi, log kỹ thuật ở console và hiển thị thông báo thân thiện trên UI.
        console.error("Lỗi tải sản phẩm:", error);

        const productList = document.getElementById("product-list");
        const homeProductList = document.getElementById("home-product-list");

        if (productList) {
            productList.innerHTML = "<p>Không thể tải sản phẩm từ server.</p>";
        }

        if (homeProductList) {
            homeProductList.innerHTML = "<p>Không thể tải sản phẩm từ server.</p>";
        }
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    // Tải sản phẩm trước, sau đó mới áp dụng filter từ URL/control.
    await loadProductsFromAPI();

    const params = new URLSearchParams(window.location.search);
    const categoryIdFromUrl = params.get("categoryId");

    const categorySelect = document.getElementById("filter-category");
    const keywordInput = document.getElementById("filter-keyword");
    const minPriceInput = document.getElementById("filter-price-min");
    const maxPriceInput = document.getElementById("filter-price-max");
    const searchBtn = document.getElementById("search-btn");

    if (categoryIdFromUrl) {
        // Nếu URL có categoryId thì set select và lọc ngay khi vào trang.
        if (categorySelect) {
            categorySelect.value = categoryIdFromUrl;
        }

        applyFilterAndRender(categoryIdFromUrl);
    }

    if (searchBtn) {
        // Nút search áp dụng toàn bộ filter hiện tại.
        searchBtn.addEventListener("click", function () {
            applyFilterAndRender();
        });
    }

    if (categorySelect) {
        // Đổi danh mục sẽ lọc lại danh sách ngay.
        categorySelect.addEventListener("change", function () {
            applyFilterAndRender();
        });
    }

    if (minPriceInput) {
        // Min price lọc khi đổi giá trị hoặc nhấn Enter.
        minPriceInput.addEventListener("change", function () {
            applyFilterAndRender();
        });

        minPriceInput.addEventListener("keyup", function (e) {
            if (e.key === "Enter") {
                applyFilterAndRender();
            }
        });
    }

    if (maxPriceInput) {
        // Max price lọc khi đổi giá trị hoặc nhấn Enter.
        maxPriceInput.addEventListener("change", function () {
            applyFilterAndRender();
        });

        maxPriceInput.addEventListener("keyup", function (e) {
            if (e.key === "Enter") {
                applyFilterAndRender();
            }
        });
    }

    if (keywordInput) {
        // Ô keyword lọc khi người dùng nhấn Enter.
        keywordInput.addEventListener("keyup", function (e) {
            if (e.key === "Enter") {
                applyFilterAndRender();
            }
        });
    }

    document.querySelectorAll(".filter-cat-link").forEach(link => {
        // Link category ở menu chuyển sang products.html kèm query categoryId.
        link.addEventListener("click", function (e) {
            e.preventDefault();

            const catId = this.getAttribute("data-category-id");

            if (catId) {
                window.location.href = `products.html?categoryId=${catId}`;
            } else {
                window.location.href = "products.html";
            }
        });
    });
});                                                                                                                               

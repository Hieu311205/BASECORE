let allProducts = [];
function formatPrice(price) {
    const value = Number(price || 0);
    return value.toLocaleString("vi-VN") + "đ";
}

function getImageUrl(imageUrl) {
    if (!imageUrl) return "assets/images/default.jpg";
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("assets/")) return imageUrl;
    return "assets/images/" + imageUrl;
}

function escapeHtml(text) {
    if (!text) return "";
    return String(text).replace(/[&<>]/g, function (m) {
        if (m === "&") return "&amp;";
        if (m === "<") return "&lt;";
        if (m === ">") return "&gt;";
        return m;
    });
}

function getProductId(product) {
    return product.ProductID || product.productID || product.productId || product.Id || product.id;
}

function getProductName(product) {
    return product.Name || product.name || "";
}

function getProductPrice(product) {
    return product.Price || product.price || 0;
}

function getProductPriceNumber(product) {
    const rawPrice = getProductPrice(product);

    if (typeof rawPrice === "number") {
        return rawPrice;
    }

    return Number(String(rawPrice || "0").replace(/[^\d.-]/g, ""));
}

function getInputPriceNumber(input) {
    if (!input || input.value.trim() === "") {
        return null;
    }

    const value = Number(input.value);
    return Number.isNaN(value) ? null : value;
}

function getProductImage(product) {
    return product.ImageUrl || product.imageUrl || product.image || product.Image || "";
}

function getProductCategoryId(product) {
    return product.CategoryId || product.categoryId || product.CategoryID || product.categoryID;
}

function getCategoryName(categoryId) {
    const id = Number(categoryId);

    if (id === 8) return "Nước hoa nam";
    if (id === 9) return "Nước hoa nữ";
    if (id === 10) return "Nước hoa unisex";
    if (id === 11) return "Gift set";

    return "Lumière Perfume";
}

function normalizeProducts(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.products)) return data.products;
    if (Array.isArray(data.result)) return data.result;
    if (Array.isArray(data.$values)) return data.$values;

    return [];
}

function attachCardClickEvents() {
    document.querySelectorAll(".product-card").forEach(card => {
        if (card.dataset.clickBound) return;

        card.dataset.clickBound = "true";

        card.addEventListener("click", function (e) {
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
    container.querySelectorAll(".add-to-cart-btn").forEach(btn => {
        if (btn.dataset.bound) return;

        btn.dataset.bound = "true";

        btn.addEventListener("click", function (e) {
            e.stopPropagation();

            const card = btn.closest(".product-card");
            if (!card) return;

            const id = card.dataset.id;
            const name = card.dataset.name;
            const price = Number(card.dataset.price);
            const imageUrl = card.dataset.image;

            if (!id || !name || isNaN(price)) {
                alert("Dữ liệu sản phẩm không hợp lệ.");
                return;
            }

            if (typeof addToCart === "function") {
                addToCart(id, name, price, imageUrl, 1);
            } else {
                alert("Hàm addToCart chưa được định nghĩa.");
            }
        });
    });
}

function renderProducts(products) {
    const productList = document.getElementById("product-list");
    if (!productList) return;

    products = Array.isArray(products) ? products : [];

    if (products.length === 0) {
        productList.innerHTML = "<p>Không có sản phẩm phù hợp.</p>";
        return;
    }

    productList.innerHTML = products.map(product => getProductHtml(product)).join("");

    bindAddToCartButtons(productList);
    attachCardClickEvents();
}

function renderProductsToContainer(products, container) {
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
    const categoryFilter = document.getElementById("filter-category");
    const keywordFilter = document.getElementById("filter-keyword");
    const minPriceInput = document.getElementById("filter-price-min");
    const maxPriceInput = document.getElementById("filter-price-max");

    let filtered = Array.isArray(allProducts) ? [...allProducts] : [];

    const categoryId = categoryIdParam || (categoryFilter ? categoryFilter.value : "");
    const keyword = keywordFilter ? keywordFilter.value.toLowerCase().trim() : "";
    const minPrice = getInputPriceNumber(minPriceInput);
    const maxPrice = getInputPriceNumber(maxPriceInput);

    if (categoryId) {
        filtered = filtered.filter(p => Number(getProductCategoryId(p)) === Number(categoryId));
    }

    if (keyword) {
        filtered = filtered.filter(p =>
            getProductName(p).toLowerCase().includes(keyword)
        );
    }

    if (minPrice !== null) {
        filtered = filtered.filter(p => getProductPriceNumber(p) >= minPrice);
    }

    if (maxPrice !== null) {
        filtered = filtered.filter(p => getProductPriceNumber(p) <= maxPrice);
    }

    renderProducts(filtered);
}

async function loadProductsFromAPI() {
    try {
        const response = await fetch("http://localhost:5000/api/products?page=1&pageSize=100");

        if (!response.ok) {
            throw new Error("Không gọi được API products");
        }

        const data = await response.json();

        console.log("DATA PRODUCTS:", data);

        allProducts = normalizeProducts(data);

        console.log("ALL PRODUCTS ARRAY:", allProducts);

        const productList = document.getElementById("product-list");
        const homeProductList = document.getElementById("home-product-list");

        if (productList) {
            renderProducts(allProducts);
        }

        if (homeProductList) {
            renderProductsToContainer(allProducts.slice(0, 6), homeProductList);
        }

    } catch (error) {
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
    await loadProductsFromAPI();

    const params = new URLSearchParams(window.location.search);
    const categoryIdFromUrl = params.get("categoryId");

    const categorySelect = document.getElementById("filter-category");
    const keywordInput = document.getElementById("filter-keyword");
    const minPriceInput = document.getElementById("filter-price-min");
    const maxPriceInput = document.getElementById("filter-price-max");
    const searchBtn = document.getElementById("search-btn");

    if (categoryIdFromUrl) {
        if (categorySelect) {
            categorySelect.value = categoryIdFromUrl;
        }

        applyFilterAndRender(categoryIdFromUrl);
    }

    if (searchBtn) {
        searchBtn.addEventListener("click", function () {
            applyFilterAndRender();
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener("change", function () {
            applyFilterAndRender();
        });
    }

    if (minPriceInput) {
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
        keywordInput.addEventListener("keyup", function (e) {
            if (e.key === "Enter") {
                applyFilterAndRender();
            }
        });
    }

    document.querySelectorAll(".filter-cat-link").forEach(link => {
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

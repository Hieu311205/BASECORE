(function () {
    "use strict";

    const CART_STORAGE_KEY = "cart";
    const DEFAULT_IMAGE = "assets/images/default.jpg";
    const ORDER_API_URL = `${window.API_BASE_URL || "http://localhost:5000/api"}/orders`;

    function toNumber(value, fallback = 0) {
        const number = Number(value);
        return Number.isFinite(number) ? number : fallback;
    }

    function normalizeQuantity(quantity) {
        return Math.max(1, Math.floor(toNumber(quantity, 1)));
    }

    function normalizeCartItem(item) {
        if (!item) return null;

        const id = toNumber(item.id || item.productId || item.ProductID || item.productID);
        const name = String(item.name || item.Name || "").trim();
        const price = toNumber(item.price || item.Price);
        const quantity = normalizeQuantity(item.quantity || item.Quantity);
        const imageUrl = item.imageUrl || item.ImageUrl || item.image || item.Image || DEFAULT_IMAGE;

        if (!id || !name || price < 0) return null;

        return { id, name, price, imageUrl, quantity };
    }

    function getCart() {
        try {
            const rawCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
            if (!Array.isArray(rawCart)) return [];

            return rawCart
                .map(normalizeCartItem)
                .filter(Boolean);
        } catch (error) {
            console.warn("Cannot read cart from localStorage:", error);
            return [];
        }
    }

    function saveCart(cart) {
        const normalizedCart = Array.isArray(cart)
            ? cart.map(normalizeCartItem).filter(Boolean)
            : [];

        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizedCart));
        updateCartCount();
    }

    function clearCart() {
        localStorage.removeItem(CART_STORAGE_KEY);
        updateCartCount();
        renderCartPage();
    }

    function getCartTotal(cart = getCart()) {
        return cart.reduce((sum, item) => {
            return sum + item.price * item.quantity;
        }, 0);
    }

    function getCartQuantity(cart = getCart()) {
        return cart.reduce((sum, item) => {
            return sum + item.quantity;
        }, 0);
    }

    function formatCurrency(value) {
        if (typeof window.formatPrice === "function") {
            return window.formatPrice(value);
        }

        return `${toNumber(value).toLocaleString("vi-VN")}đ`;
    }

    function escapeText(value) {
        if (typeof window.escapeHtml === "function") {
            return window.escapeHtml(value);
        }

        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function getDisplayImageUrl(imageUrl) {
        if (!imageUrl) return DEFAULT_IMAGE;
        if (String(imageUrl).startsWith("http")) return imageUrl;
        if (String(imageUrl).startsWith("/assets/")) return String(imageUrl).slice(1);
        if (String(imageUrl).startsWith("assets/")) return imageUrl;
        return `assets/images/${imageUrl}`;
    }

    function parseJson(value) {
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }

    function decodeJwtPayload(token) {
        if (!token || typeof token !== "string") return null;

        const payload = token.split(".")[1];
        if (!payload) return null;

        try {
            const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
            const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");
            const json = decodeURIComponent(
                atob(paddedBase64)
                    .split("")
                    .map(char => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
                    .join("")
            );

            return JSON.parse(json);
        } catch (error) {
            console.warn("Cannot decode token payload:", error);
            return null;
        }
    }

    function getUserIdFromObject(user) {
        if (!user || typeof user !== "object") return 0;

        const claimUserId = user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        return toNumber(
            user.userId ||
            user.UserId ||
            user.id ||
            user.Id ||
            user.sub ||
            user.nameid ||
            claimUserId
        );
    }

    function getCheckoutUserId() {
        const storedUser = parseJson(localStorage.getItem("user") || "");
        const userIdFromStorage = getUserIdFromObject(storedUser);
        if (userIdFromStorage) return userIdFromStorage;

        const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
        const userIdFromToken = getUserIdFromObject(decodeJwtPayload(token));
        if (userIdFromToken) return userIdFromToken;

        return 16;
    }

    function addToCart(id, name, price, imageUrl, quantity = 1) {
        const newItem = normalizeCartItem({ id, name, price, imageUrl, quantity });

        if (!newItem) {
            alert("Dữ liệu sản phẩm không hợp lệ.");
            return;
        }

        const cart = getCart();
        const existingItem = cart.find(item => item.id === newItem.id);

        if (existingItem) {
            existingItem.quantity += newItem.quantity;
        } else {
            cart.push(newItem);
        }

        saveCart(cart);
        renderCartPage();
        alert("Đã thêm vào giỏ hàng.");
    }

    function removeFromCart(id) {
        const productId = toNumber(id);
        const cart = getCart().filter(item => item.id !== productId);

        saveCart(cart);
        renderCartPage();
    }

    function updateCartItemQuantity(id, quantity) {
        const productId = toNumber(id);
        const nextQuantity = Math.floor(toNumber(quantity));
        let cart = getCart();

        if (nextQuantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        } else {
            cart = cart.map(item => {
                if (item.id !== productId) return item;
                return { ...item, quantity: nextQuantity };
            });
        }

        saveCart(cart);
        renderCartPage();
    }

    function updateCartCount() {
        const totalQuantity = getCartQuantity();

        document.querySelectorAll(".cart-badge").forEach(badge => {
            badge.textContent = String(totalQuantity);
        });
    }

    function getEmptyCartHtml() {
        return `
            <div class="dark-panel text-center" style="padding: 50px 20px;">
                <i class="fa fa-shopping-cart fa-3x" style="color: #d4af37; margin-bottom: 20px;"></i>
                <h3>Giỏ hàng của bạn đang trống</h3>
                <p>Hãy khám phá những mùi hương tinh tế tại Lumière.</p>
                <a href="products.html" class="gold-btn" style="display: inline-block; margin-top: 15px;">
                    Tiếp tục mua sắm
                </a>
            </div>
        `;
    }

    function getCartRowHtml(item) {
        const subtotal = item.price * item.quantity;
        const imageUrl = getDisplayImageUrl(item.imageUrl);

        return `
            <tr data-id="${item.id}">
                <td data-label="Sản phẩm" style="display: flex; align-items: center; gap: 15px;">
                    <img src="${escapeText(imageUrl)}" alt="${escapeText(item.name)}" width="60" height="60" style="border-radius: 8px; object-fit: cover;">
                    <strong>${escapeText(item.name)}</strong>
                </td>
                <td data-label="Đơn giá">${formatCurrency(item.price)}</td>
                <td data-label="Số lượng">
                    <input type="number" class="cart-qty" value="${item.quantity}" min="1" data-id="${item.id}">
                </td>
                <td data-label="Thành tiền">${formatCurrency(subtotal)}</td>
                <td data-label="">
                    <button type="button" class="remove-item" data-id="${item.id}">
                        <i class="fa fa-trash-o"></i> Xóa
                    </button>
                </td>
            </tr>
        `;
    }

    function getCartTableHtml(cart) {
        return `
            <div class="dark-panel" style="padding: 20px;">
                <table class="cart-table-custom">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Đơn giá</th>
                            <th>Số lượng</th>
                            <th>Thành tiền</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cart.map(getCartRowHtml).join("")}
                    </tbody>
                </table>
                <div class="cart-total">
                    <h3>Tổng cộng: <span id="cart-total">${formatCurrency(getCartTotal(cart))}</span></h3>
                    <button type="button" class="gold-btn" id="checkout-btn" style="margin-top: 15px;">
                        TIẾN HÀNH THANH TOÁN
                    </button>
                </div>
            </div>
        `;
    }

    function bindCartPageEvents(container) {
        container.querySelectorAll(".cart-qty").forEach(input => {
            input.addEventListener("change", function () {
                updateCartItemQuantity(this.dataset.id, this.value);
            });
        });

        container.querySelectorAll(".remove-item").forEach(button => {
            button.addEventListener("click", function () {
                removeFromCart(this.dataset.id);
            });
        });

        const checkoutButton = container.querySelector("#checkout-btn");
        if (checkoutButton) {
            checkoutButton.addEventListener("click", goToCheckoutPage);
        }
    }

    function renderCartPage() {
        const container = document.getElementById("cart-container");
        if (!container) return;

        const cart = getCart();
        container.innerHTML = cart.length === 0
            ? getEmptyCartHtml()
            : getCartTableHtml(cart);

        bindCartPageEvents(container);
    }

    async function getErrorMessage(response) {
        try {
            const text = await response.text();
            if (!text) return "Thanh toán thất bại.";

            try {
                const data = JSON.parse(text);
                return data.message || data.title || text;
            } catch {
                return text;
            }
        } catch (error) {
            console.error("Cannot read error response:", error);
            return "Thanh toán thất bại.";
        }
    }

    function goToCheckoutPage() {
        const cart = getCart();

        if (cart.length === 0) {
            alert("Giỏ hàng đang trống.");
            return;
        }

        window.location.href = "checkout.html";
    }

    async function placeOrder(shippingAddress) {
        const cart = getCart();

        if (cart.length === 0) {
            alert("Giỏ hàng đang trống.");
            return false;
        }

        if (!shippingAddress || !shippingAddress.trim()) return;

        const orderData = {
            userId: getCheckoutUserId(),
            shippingAddress: shippingAddress.trim(),
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }))
        };

        try {
            const response = await fetch(ORDER_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(orderData)
            });

            if (response.status === 401) {
                alert("API đặt hàng vẫn đang yêu cầu đăng nhập. Hãy chạy lại backend sau khi cập nhật OrdersController.");
                return;
            }

            if (!response.ok) {
                alert(await getErrorMessage(response));
                return;
            }

            clearCart();
            alert("Đặt hàng thành công!");
            window.location.href = "index.html";
            return true;
        } catch (error) {
            console.error("Checkout failed:", error);
            alert("Không thể kết nối server thanh toán.");
            return false;
        }
    }

    async function checkout() {
        const shippingAddress = prompt("Nhập địa chỉ giao hàng:", "Khách mua online");
        return await placeOrder(shippingAddress);
    }

    window.getCart = getCart;
    window.saveCart = saveCart;
    window.clearCart = clearCart;
    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;
    window.updateCartItemQuantity = updateCartItemQuantity;
    window.updateCartCount = updateCartCount;
    window.renderCartPage = renderCartPage;
    window.getCartTotal = getCartTotal;
    window.placeOrder = placeOrder;
    window.checkout = checkout;

    document.addEventListener("DOMContentLoaded", function () {
        updateCartCount();
        renderCartPage();
    });
})();

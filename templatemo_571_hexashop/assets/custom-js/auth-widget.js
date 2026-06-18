(function () {
    "use strict";

    const USER_KEY = "user";
    const TOKEN_KEY = "token";

    function parseJson(value) {
        // localStorage có thể chứa dữ liệu lỗi, nên parse fail thì trả null thay vì làm hỏng trang.
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }

    function getCurrentUser() {
        // Lấy user hiện tại đã lưu sau khi đăng nhập.
        return parseJson(localStorage.getItem(USER_KEY) || "");
    }

    function getUserName(user) {
        // Hỗ trợ nhiều kiểu casing vì API/frontend có thể trả Name/name/UserName khác nhau.
        if (!user) return "";
        return user.name || user.Name || user.username || user.Username || user.userName || user.UserName || "Tai khoan";
    }

    function injectStyles() {
        // Chỉ inject CSS một lần để tránh tạo nhiều thẻ style khi render lại widget.
        if (document.getElementById("auth-widget-style")) return;

        const style = document.createElement("style");
        style.id = "auth-widget-style";
        style.textContent = `
            .auth-floating-widget {
                position: fixed;
                top: 16px;
                right: 18px;
                z-index: 2000;
                font-family: "Poppins", Arial, sans-serif;
            }
            .auth-floating-main {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                border: 1px solid rgba(212, 175, 55, 0.75);
                background: #080808;
                color: #d4af37;
                border-radius: 999px;
                padding: 9px 14px;
                font-size: 13px;
                font-weight: 700;
                box-shadow: 0 10px 28px rgba(0, 0, 0, 0.32);
                cursor: pointer;
                text-decoration: none;
            }
            .auth-floating-main:hover {
                color: #080808;
                background: #d4af37;
                text-decoration: none;
            }
            .auth-floating-menu {
                display: none;
                position: absolute;
                top: 44px;
                right: 0;
                min-width: 180px;
                background: #080808;
                border: 1px solid rgba(212, 175, 55, 0.5);
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 16px 38px rgba(0, 0, 0, 0.4);
            }
            .auth-floating-menu.show {
                display: block;
            }
            .auth-floating-menu a,
            .auth-floating-menu button {
                display: block;
                width: 100%;
                border: 0;
                background: transparent;
                color: #fff;
                text-align: left;
                padding: 11px 14px;
                font-size: 13px;
                cursor: pointer;
                text-decoration: none;
            }
            .auth-floating-menu a:hover,
            .auth-floating-menu button:hover {
                background: #d4af37;
                color: #080808;
                text-decoration: none;
            }
            @media (max-width: 768px) {
                .auth-floating-widget {
                    top: auto;
                    right: 14px;
                    bottom: 18px;
                }
                .auth-floating-menu {
                    top: auto;
                    bottom: 44px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function logout() {
        // Xóa mọi key token/user phổ biến rồi reload để UI quay về trạng thái chưa đăng nhập.
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("accessToken");
        window.location.reload();
    }

    function renderAuthWidget() {
        // Render nút đăng nhập/tài khoản dạng floating để dùng chung trên các trang HTML.
        injectStyles();

        const existingWidget = document.getElementById("auth-floating-widget");
        if (existingWidget) existingWidget.remove();

        const user = getCurrentUser();
        const widget = document.createElement("div");
        widget.id = "auth-floating-widget";
        widget.className = "auth-floating-widget";

        if (user) {
            // Đã đăng nhập: hiển thị tên user, link checkout và nút đăng xuất.
            widget.innerHTML = `
                <button type="button" class="auth-floating-main" id="auth-floating-toggle">
                    <i class="fa fa-user-circle"></i>
                    <span>${getUserName(user)}</span>
                </button>
                <div class="auth-floating-menu" id="auth-floating-menu">
                    <a href="checkout.html">Thanh toan</a>
                    <button type="button" id="auth-logout-btn">Dang xuat</button>
                </div>
            `;
        } else {
            // Chưa đăng nhập: hiển thị menu đăng nhập/đăng ký.
            widget.innerHTML = `
                <button type="button" class="auth-floating-main" id="auth-floating-toggle">
                    <i class="fa fa-user"></i>
                    <span>Dang nhap</span>
                </button>
                <div class="auth-floating-menu" id="auth-floating-menu">
                    <a href="login.html">Dang nhap</a>
                    <a href="register.html">Dang ky</a>
                </div>
            `;
        }

        document.body.appendChild(widget);

        const toggle = document.getElementById("auth-floating-toggle");
        const menu = document.getElementById("auth-floating-menu");
        const logoutButton = document.getElementById("auth-logout-btn");

        if (toggle && menu) {
            // Toggle menu khi click vào nút chính.
            toggle.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                menu.classList.toggle("show");
            });

            document.addEventListener("click", function (event) {
                // Click ra ngoài widget thì đóng menu.
                if (!widget.contains(event.target)) {
                    menu.classList.remove("show");
                }
            });
        }

        if (logoutButton) {
            // Gắn sự kiện logout khi nút tồn tại trong trạng thái đã đăng nhập.
            logoutButton.addEventListener("click", logout);
        }
    }

    function bindNewsletterRegister() {
        // Form newsletter chuyển người dùng sang trang đăng ký, kèm email nhập sẵn qua query string.
        const form = document.getElementById("newsletter-register-form");
        if (!form) return;

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const emailInput = document.getElementById("newsletter-email");
            const email = emailInput ? emailInput.value.trim() : "";
            const targetUrl = email
                ? `register.html?email=${encodeURIComponent(email)}`
                : "register.html";

            window.location.href = targetUrl;
        });
    }

    window.getCustomerUser = getCurrentUser;
    // Expose hàm render để trang khác có thể gọi lại sau khi login/logout bằng AJAX.
    window.renderAuthWidget = renderAuthWidget;

    document.addEventListener("DOMContentLoaded", function () {
        // Khởi tạo widget và form newsletter sau khi DOM sẵn sàng.
        renderAuthWidget();
        bindNewsletterRegister();
    });
})();

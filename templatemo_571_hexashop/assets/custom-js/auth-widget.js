(function () {
    "use strict";

    const USER_KEY = "user";
    const TOKEN_KEY = "token";

    function parseJson(value) {
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }

    function getCurrentUser() {
        return parseJson(localStorage.getItem(USER_KEY) || "");
    }

    function getUserName(user) {
        if (!user) return "";
        return user.name || user.Name || user.username || user.Username || user.userName || user.UserName || "Tai khoan";
    }

    function injectStyles() {
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
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("accessToken");
        window.location.reload();
    }

    function renderAuthWidget() {
        injectStyles();

        const existingWidget = document.getElementById("auth-floating-widget");
        if (existingWidget) existingWidget.remove();

        const user = getCurrentUser();
        const widget = document.createElement("div");
        widget.id = "auth-floating-widget";
        widget.className = "auth-floating-widget";

        if (user) {
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
            toggle.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                menu.classList.toggle("show");
            });

            document.addEventListener("click", function (event) {
                if (!widget.contains(event.target)) {
                    menu.classList.remove("show");
                }
            });
        }

        if (logoutButton) {
            logoutButton.addEventListener("click", logout);
        }
    }

    function bindNewsletterRegister() {
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
    window.renderAuthWidget = renderAuthWidget;

    document.addEventListener("DOMContentLoaded", function () {
        renderAuthWidget();
        bindNewsletterRegister();
    });
})();

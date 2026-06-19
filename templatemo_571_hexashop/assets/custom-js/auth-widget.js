(function () {
    "use strict";

    const USER_KEY = "user";
    const TOKEN_KEY = "token";
    const AUTH_API = (window.API_BASE_URL || "http://localhost:5000/api") + "/auth";

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
                min-width: 200px;
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
            .auth-floating-menu .menu-divider {
                border: none;
                border-top: 1px solid rgba(212,175,55,0.2);
                margin: 4px 0;
            }
            .auth-google-btn {
                display: flex !important;
                align-items: center;
                gap: 8px;
                padding: 10px 14px !important;
                background: #fff !important;
                color: #333 !important;
                font-weight: 600 !important;
                border-top: 1px solid rgba(212,175,55,0.2);
            }
            .auth-google-btn:hover {
                background: #f0f0f0 !important;
                color: #000 !important;
            }
            .auth-google-btn i { color: #4285F4; }
            .auth-google-label { font-size: 11px; color: #888; padding: 6px 14px 2px; display: block; }
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

    // Xử lý credential trả về từ Google Sign-In.
    async function handleGoogleCredential(response) {
        const idToken = response.credential;
        try {
            const res = await fetch(AUTH_API + "/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(data.message || "Dang nhap Google that bai.");
                return;
            }
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify({
                id: data.userId,
                userId: data.userId,
                username: data.username,
                name: data.name,
                email: data.email,
                role: data.role,
                isGoogleUser: true
            }));
            window.location.reload();
        } catch {
            alert("Khong the ket noi server de dang nhap Google.");
        }
    }
    // Expose để GIS gọi callback global (GIS yêu cầu hàm global).
    window.handleGoogleCredential = handleGoogleCredential;

    function loadGoogleSignIn(containerId) {
        const clientId = window.GOOGLE_CLIENT_ID;
        // Bỏ qua nếu chưa cấu hình Client ID thật.
        if (!clientId || clientId.startsWith("YOUR_GOOGLE")) return;

        function initButton() {
            if (!window.google || !window.google.accounts) return;
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: handleGoogleCredential
            });
            const container = document.getElementById(containerId);
            if (container) {
                window.google.accounts.id.renderButton(container, {
                    theme: "outline",
                    size: "medium",
                    width: 172,
                    text: "signin_with"
                });
            }
        }

        if (window.google && window.google.accounts) {
            initButton();
        } else if (!document.getElementById("gsi-client-script")) {
            const script = document.createElement("script");
            script.id = "gsi-client-script";
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = initButton;
            document.head.appendChild(script);
        }
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
            const googleBadge = user.isGoogleUser
                ? `<i class="fa fa-google" style="color:#4285F4;font-size:12px;"></i>`
                : "";
            widget.innerHTML = `
                <button type="button" class="auth-floating-main" id="auth-floating-toggle">
                    <i class="fa fa-user-circle"></i>
                    <span>${getUserName(user)}</span>
                    ${googleBadge}
                </button>
                <div class="auth-floating-menu" id="auth-floating-menu">
                    <a href="checkout.html"><i class="fa fa-shopping-bag" style="margin-right:6px;"></i>Thanh toan</a>
                    <a href="addresses.html"><i class="fa fa-map-marker" style="margin-right:6px;"></i>So dia chi</a>
                    <hr class="menu-divider">
                    <button type="button" id="auth-logout-btn"><i class="fa fa-sign-out" style="margin-right:6px;"></i>Dang xuat</button>
                </div>
            `;
        } else {
            widget.innerHTML = `
                <button type="button" class="auth-floating-main" id="auth-floating-toggle">
                    <i class="fa fa-user"></i>
                    <span>Dang nhap</span>
                </button>
                <div class="auth-floating-menu" id="auth-floating-menu">
                    <a href="login.html"><i class="fa fa-sign-in" style="margin-right:6px;"></i>Dang nhap</a>
                    <a href="register.html"><i class="fa fa-user-plus" style="margin-right:6px;"></i>Dang ky</a>
                    <span class="auth-google-label">hoac</span>
                    <button type="button" class="auth-google-btn" id="google-login-trigger">
                        <i class="fa fa-google"></i> Dang nhap voi Google
                    </button>
                    <div id="google-signin-container" style="padding:6px 14px 8px;"></div>
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
                const willShow = !menu.classList.contains("show");
                menu.classList.toggle("show");
                // Load GIS button khi menu mở lần đầu.
                if (willShow) loadGoogleSignIn("google-signin-container");
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

        const googleTrigger = document.getElementById("google-login-trigger");
        if (googleTrigger) {
            googleTrigger.addEventListener("click", function () {
                if (window.google && window.google.accounts) {
                    window.google.accounts.id.prompt();
                }
            });
        }
    }

    function bindNewsletterRegister() {
        const form = document.getElementById("newsletter-register-form");
        if (!form) return;

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const emailInput = document.getElementById("newsletter-email");
            const email = emailInput ? emailInput.value.trim() : "";
            window.location.href = email
                ? `register.html?email=${encodeURIComponent(email)}`
                : "register.html";
        });
    }

    window.getCustomerUser = getCurrentUser;
    window.getCurrentUser = getCurrentUser;
    window.renderAuthWidget = renderAuthWidget;

    document.addEventListener("DOMContentLoaded", function () {
        renderAuthWidget();
        bindNewsletterRegister();
    });
})();

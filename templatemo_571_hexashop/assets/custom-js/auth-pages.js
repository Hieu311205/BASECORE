(function () {
    "use strict";

    const AUTH_API_URL = `${window.API_BASE_URL || "http://localhost:5000/api"}/auth`;

    function setMessage(message, type) {
        const box = document.getElementById("auth-message");
        if (!box) return;

        box.className = `auth-message ${type || "error"}`;
        box.textContent = message || "";
        box.style.display = message ? "block" : "none";
    }

    async function readResponse(response) {
        const text = await response.text();
        if (!text) return {};

        try {
            return JSON.parse(text);
        } catch {
            return { message: text };
        }
    }

    async function login(username, password) {
        const response = await fetch(`${AUTH_API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await readResponse(response);

        if (!response.ok) {
            throw new Error(data.message || "Dang nhap that bai.");
        }

        if (String(data.role || "").toLowerCase() !== "user") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            throw new Error("Trang nguoi dung cuoi chi cho phep dang nhap tai khoan User.");
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
        return data;
    }

    async function register(payload) {
        const response = await fetch(`${AUTH_API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await readResponse(response);

        if (!response.ok) {
            throw new Error(data.message || "Dang ky that bai.");
        }

        return data;
    }

    function bindLoginForm() {
        const form = document.getElementById("login-form");
        if (!form) return;

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            setMessage("");

            const button = form.querySelector("button[type='submit']");
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value;

            if (button) {
                button.disabled = true;
                button.textContent = "DANG DANG NHAP...";
            }

            try {
                await login(username, password);
                setMessage("Dang nhap thanh cong.", "success");
                window.location.href = "index.html";
            } catch (error) {
                setMessage(error.message);
            } finally {
                if (button) {
                    button.disabled = false;
                    button.textContent = "DANG NHAP";
                }
            }
        });
    }

    function bindRegisterForm() {
        const form = document.getElementById("register-form");
        if (!form) return;

        const emailFromQuery = new URLSearchParams(window.location.search).get("email");
        const emailInput = document.getElementById("email");
        if (emailFromQuery && emailInput) {
            emailInput.value = emailFromQuery;
        }

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            setMessage("");

            const button = form.querySelector("button[type='submit']");
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            if (password !== confirmPassword) {
                setMessage("Mat khau xac nhan khong khop.");
                return;
            }

            const payload = {
                username: document.getElementById("username").value.trim(),
                password,
                name: document.getElementById("name").value.trim(),
                email: document.getElementById("email").value.trim(),
                phone: document.getElementById("phone").value.trim()
            };

            if (button) {
                button.disabled = true;
                button.textContent = "DANG TAO...";
            }

            try {
                await register(payload);
                setMessage("Dang ky thanh cong. Vui long dang nhap.", "success");
                setTimeout(function () {
                    window.location.href = "login.html";
                }, 900);
            } catch (error) {
                setMessage(error.message);
            } finally {
                if (button) {
                    button.disabled = false;
                    button.textContent = "DANG KY";
                }
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        bindLoginForm();
        bindRegisterForm();
    });
})();

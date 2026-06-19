// Thư viện sổ địa chỉ dùng chung (trang quản lý địa chỉ + trang checkout).
// Yêu cầu: cart.js đã load trước (dùng window.getCheckoutUserId).
(function () {
    "use strict";

    const API = window.API_BASE_URL || "http://localhost:5000/api";
    const ADDR_URL = `${API}/addresses`;

    function getUserId() {
        if (typeof window.getCheckoutUserId === "function") {
            return window.getCheckoutUserId();
        }
        return 16;
    }

    async function readError(response) {
        try {
            const text = await response.text();
            if (!text) return "Thao tác thất bại.";
            try {
                const data = JSON.parse(text);
                return data.message || data.title || text;
            } catch {
                return text;
            }
        } catch {
            return "Thao tác thất bại.";
        }
    }

    // API trả về { success, data, message } - lấy phần data (mảng địa chỉ).
    function unwrap(json) {
        if (!json) return null;
        if (Object.prototype.hasOwnProperty.call(json, "data")) return json.data;
        return json;
    }

    async function list() {
        const userId = getUserId();
        const response = await fetch(`${ADDR_URL}?userId=${userId}`);
        if (!response.ok) throw new Error(await readError(response));
        const data = unwrap(await response.json());
        return Array.isArray(data) ? data : [];
    }

    async function create(payload) {
        const body = { ...payload, userId: getUserId() };
        const response = await fetch(ADDR_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error(await readError(response));
        return unwrap(await response.json());
    }

    async function update(id, payload) {
        const body = { ...payload, userId: getUserId() };
        const response = await fetch(`${ADDR_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error(await readError(response));
        return unwrap(await response.json());
    }

    async function setDefault(id) {
        const response = await fetch(`${ADDR_URL}/${id}/default`, { method: "PUT" });
        if (!response.ok) throw new Error(await readError(response));
        return unwrap(await response.json());
    }

    async function remove(id) {
        const response = await fetch(`${ADDR_URL}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error(await readError(response));
        return true;
    }

    window.AddressBook = { getUserId, list, create, update, setDefault, remove };
})();

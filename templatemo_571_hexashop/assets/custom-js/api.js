const API_BASE_URL = "http://localhost:5000/api";
window.API_BASE_URL = API_BASE_URL;

async function apiGet(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
        throw new Error(`GET ${endpoint} thất bại: ${response.status}`);
    }

    return await response.json();
}

function formatPrice(price) {
    return Number(price || 0).toLocaleString("vi-VN") + "đ";
}

function getImageUrl(imageUrl) {
    if (imageUrl && imageUrl.trim() !== "") {
        if (imageUrl.startsWith("http")) return imageUrl;
        return `assets/images/${imageUrl}`;
    }
    return "assets/images/perfume-1.jpg";
}

function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

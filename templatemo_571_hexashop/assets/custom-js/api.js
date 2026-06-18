const API_BASE_URL = "http://localhost:5000/api";
// Gắn lên window để các file JS khác dùng chung cùng một base URL.
window.API_BASE_URL = API_BASE_URL;

async function apiGet(endpoint) {
    // Hàm GET dùng chung cho các trang template, tự throw lỗi khi server trả HTTP error.
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
        throw new Error(`GET ${endpoint} thất bại: ${response.status}`);
    }

    return await response.json();
}

function formatPrice(price) {
    // Format tiền theo locale Việt Nam và thêm ký hiệu đồng.
    return Number(price || 0).toLocaleString("vi-VN") + "đ";
}

function getImageUrl(imageUrl) {
    // Chuẩn hóa đường dẫn ảnh: URL tuyệt đối giữ nguyên, tên file thì trỏ vào assets/images.
    if (imageUrl && imageUrl.trim() !== "") {
        if (imageUrl.startsWith("http")) return imageUrl;
        return `assets/images/${imageUrl}`;
    }
    return "assets/images/perfume-1.jpg";
}

function escapeHtml(text) {
    // Escape dữ liệu trước khi nhúng vào HTML để tránh lỗi layout/XSS cơ bản.
    if (text === null || text === undefined) return "";
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

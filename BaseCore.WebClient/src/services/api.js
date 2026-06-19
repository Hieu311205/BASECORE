import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const user = localStorage.getItem('user');
            if (user) {
                // Chỉ redirect khi user đã từng đăng nhập (tránh loop ở trang login)
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        if (error.response?.status === 429) {
            console.warn('Rate limit exceeded. Please slow down requests.');
        }
        return Promise.reject(error);
    }
);

// Kiểm tra token có hết hạn không (client-side, trước khi gửi request)
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            if (isTokenExpired(token)) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(new Error('Token expired'));
            }
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth API
export const authApi = {
    login: (username, password) => api.post('/auth/login', { username, password }),
    register: (data) => api.post('/auth/register', data),
};

// User API
export const userApi = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
};

// Product API
export const productApi = {
    getAll: (params) => api.get('/products', { params }),
    search: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

// Category API
export const categoryApi = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

// Order API
export const orderApi = {
    getAll: (params) => api.get('/orders/all', { params }),
    create: (data) => api.post('/orders', data),
    getById: (id) => api.get(`/orders/${id}`),
    update: (id, data) => api.put(`/orders/${id}/status`, { status: data.status }),
    delete: (id) => api.put(`/orders/${id}/cancel`),
    getMyOrders: () => api.get('/orders'),
};
export const suppliersApi = {
    getAll: (params) => api.get('/suppliers', { params }),
    search: (params) => api.get('/suppliers', { params }),
    getById: (id) => api.get(`/suppliers/${id}`),
    create: (data) => api.post('/suppliers', data),
    update: (id, data) => api.put(`/suppliers/${id}`, data),
    delete: (id) => api.delete(`/suppliers/${id}`),
};
export default api;

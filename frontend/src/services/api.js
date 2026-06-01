import axios from 'axios';

// In dev, use Vite proxy (relative /api) when VITE_API_BASE_URL is unset
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

const AUTH_URLS = ['/api/auth/login', '/api/auth/login/json', '/api/auth/signup'];

function isAuthRoute() {
  const path = window.location.pathname;
  return path === '/login' || path === '/signup' || path === '/forgot-password';
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const requestUrl = err.config?.url || '';
    const isAuthRequest = AUTH_URLS.some((u) => requestUrl.includes(u));

    if (err.response?.status === 401 && !isAuthRequest && !isAuthRoute()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (usernameOrEmail, password) =>
    api.post('/api/auth/login/json', { username_or_email: usernameOrEmail, password }),
  signup: (data) => api.post('/api/auth/signup', data),
  me: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
};

export const productsAPI = {
  list: (params) => api.get('/api/products', { params }),
  get: (id) => api.get(`/api/products/${id}`),
  getPublic: (id) => api.get(`/api/products/public/${id}`),
  listPublic: (params) => api.get('/api/products/public', { params }),
  featured: (limit = 8) => api.get('/api/products/featured', { params: { limit } }),
  create: (data) => api.post('/api/products', data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
  categories: () => api.get('/api/products/categories'),
};

export const customersAPI = {
  list: (params) => api.get('/api/customers', { params }),
  get: (id) => api.get(`/api/customers/${id}`),
  create: (data) => api.post('/api/customers', data),
  update: (id, data) => api.put(`/api/customers/${id}`, data),
  delete: (id) => api.delete(`/api/customers/${id}`),
};

export const ordersAPI = {
  list: (params) => api.get('/api/orders', { params }),
  get: (id) => api.get(`/api/orders/${id}`),
  create: (data) => api.post('/api/orders', data),
  updateStatus: (id, status) => api.patch(`/api/orders/${id}/status`, { status }),
  cancel: (id) => api.post(`/api/orders/${id}/cancel`),
};

export const inventoryAPI = {
  dashboard: (params) => api.get('/api/inventory/dashboard', { params }),
  logs: (params) => api.get('/api/inventory/logs', { params }),
  lowStock: (params) => api.get('/api/inventory/low-stock', { params }),
};

export const reportsAPI = {
  summary: () => api.get('/api/reports/summary'),
};

export default api;

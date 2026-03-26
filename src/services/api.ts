import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ── Change this to your computer's local IP when testing on a real phone
// ── On Windows: run `ipconfig` in CMD and look for IPv4 Address
// ── Example: 'http://192.168.1.45:8000'
// ── On emulator/simulator: 'http://10.0.2.2:8000' (Android) or 'http://localhost:8000' (iOS sim)
export const API_BASE_URL = 'http://192.168.88.122:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = await SecureStore.getItemAsync('refresh_token');
        const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/token/refresh/`, { refresh });
        await SecureStore.setItemAsync('access_token', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: any) => api.post('/auth/register/', data),
  login: (email: string, password: string) =>
    api.post('/auth/login/', { email, password }),
  logout: (refresh: string) => api.post('/auth/logout/', { refresh }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data: any) => api.patch('/auth/profile/', data),
};

// ── Stores ────────────────────────────────────────────────────────────────────
export const storesAPI = {
  list: (params?: any) => api.get('/stores/', { params }),
  detail: (id: string) => api.get(`/stores/${id}/`),
  reviews: (id: string) => api.get(`/stores/${id}/reviews/`),
  addReview: (id: string, data: any) => api.post(`/stores/${id}/reviews/`, data),
};

// ── Listings ──────────────────────────────────────────────────────────────────
export const listingsAPI = {
  list: (params?: any) => api.get('/listings/', { params }),
  storeFeed: (storeId: string) => api.get(`/listings/store/${storeId}/`),
  detail: (id: string) => api.get(`/listings/${id}/`),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersAPI = {
  create: (items: { listing_id: string; quantity: number }[]) =>
    api.post('/orders/', { items }),
  history: () => api.get('/orders/history/'),
  detail: (id: string) => api.get(`/orders/${id}/`),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsAPI = {
  list: () => api.get('/notifications/'),
  markAllRead: () => api.patch('/notifications/read-all/'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read/`),
};

export default api;

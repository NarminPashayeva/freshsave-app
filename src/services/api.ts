import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Set EXPO_PUBLIC_API_URL in your .env file
// Example: EXPO_PUBLIC_API_URL=http://192.168.1.45:8000
// Find your local IP with `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

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
      } catch (refreshError) {
        // Refresh failed — clear tokens and let the app redirect to login
        console.warn('[api] Token refresh failed, clearing session:', refreshError);
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: RegisterPayload) => api.post('/auth/register/', data),
  login: (email: string, password: string) =>
    api.post('/auth/login/', { email, password }),
  logout: (refresh: string) => api.post('/auth/logout/', { refresh }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data: UpdateProfilePayload) => api.patch('/auth/profile/', data),
  forgotPassword: (email: string) => api.post('/auth/password-reset/', { email }),
};

// ── Stores ────────────────────────────────────────────────────────────────────
export const storesAPI = {
  list: (params?: StoreListParams) => api.get('/stores/', { params }),
  detail: (id: string) => api.get(`/stores/${id}/`),
  reviews: (id: string) => api.get(`/stores/${id}/reviews/`),
  addReview: (id: string, data: ReviewPayload) => api.post(`/stores/${id}/reviews/`, data),
};

// ── Listings ──────────────────────────────────────────────────────────────────
export const listingsAPI = {
  list: (params?: Record<string, unknown>) => api.get('/listings/', { params }),
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

/**
 * Extract a human-readable message from any Axios error.
 * Use this in catch blocks across all screens.
 */
export function getErrorMessage(e: unknown, fallback = 'Something went wrong'): string {
  const err = e as any;
  // No response at all = network/timeout issue
  if (!err?.response) {
    if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
      return "Can't reach the server. Make sure the backend is running and your IP in .env is correct.";
    }
    return 'Network error — check your connection and try again.';
  }
  const data = err.response?.data;
  if (!data) return `Server error (${err.response?.status})`;
  if (typeof data === 'string') return data;
  if (typeof data === 'object' && !Array.isArray(data)) {
    const { detail, non_field_errors, ...fields } = data as Record<string, unknown>;
    if (detail) return String(detail);
    if (non_field_errors) return Array.isArray(non_field_errors) ? non_field_errors.join(' ') : String(non_field_errors);
    // Field errors: "email: already exists. password: too short."
    const parts = Object.entries(fields).map(([k, v]) =>
      `${k}: ${Array.isArray(v) ? v.join(' ') : v}`
    );
    if (parts.length) return parts.join(' ');
  }
  return fallback;
}

// ── Payload types ─────────────────────────────────────────────────────────────
export interface RegisterPayload {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  password2: string;
  role: string;
}

export interface UpdateProfilePayload {
  full_name?: string;
  phone?: string;
  avatar?: string;
}

export interface ReviewPayload {
  rating: number;
  comment: string;
}

export interface StoreListParams {
  search?: string;
  category?: string;
}

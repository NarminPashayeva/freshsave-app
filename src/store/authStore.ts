import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authAPI, RegisterPayload, UpdateProfilePayload } from '../services/api';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  avatar: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (data: UpdateProfilePayload) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await authAPI.login(email, password);
    await SecureStore.setItemAsync('access_token', data.access);
    await SecureStore.setItemAsync('refresh_token', data.refresh);
    set({ user: data.user, isAuthenticated: true });
  },

  register: async (formData) => {
    const { data } = await authAPI.register(formData);
    await SecureStore.setItemAsync('access_token', data.access);
    await SecureStore.setItemAsync('refresh_token', data.refresh);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      const refresh = await SecureStore.getItemAsync('refresh_token');
      if (refresh) await authAPI.logout(refresh);
    } catch (err) {
      // Logout API call failed (e.g. already expired) — still clear local session
      console.warn('[auth] Logout API error:', err);
    }
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) { set({ isLoading: false }); return; }
      const { data } = await authAPI.getProfile();
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (err) {
      // Token invalid or network error — treat as logged out
      console.warn('[auth] loadUser failed:', err);
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      set({ isLoading: false });
    }
  },

  updateUser: async (data) => {
    const { data: updated } = await authAPI.updateProfile(data);
    set({ user: updated });
  },
}));

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../api/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (token: string, userData: User) => {
    await SecureStore.setItemAsync('vault_jwt_token', token);
    set({ user: userData, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('vault_jwt_token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await SecureStore.getItemAsync('vault_jwt_token');
      if (!token) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }

      // Verify token with backend
      const res = await apiClient.get('/auth/me');
      if (res.data?.data?.user) {
        set({ user: res.data.data.user, isAuthenticated: true });
      } else {
        set({ isAuthenticated: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      set({ isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  }
}));

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from '@/lib/secureStorage';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isApproved?: boolean;
  isActive?: boolean;
  clearanceLevel?: number;
  settings?: any;
  avatarUrl?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  clearAuth: () => void;
  setAuth: (user: User, token: string) => void;
  updateSettings: (settings: any) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      clearAuth: () => set({ token: null, user: null, isAuthenticated: false }),
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      updateSettings: (settings) => set((state) => ({
        user: state.user ? { ...state.user, settings: { ...state.user.settings, ...settings } } : null
      })),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'vault-auth-storage',
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated();
      },
    }
  )
);

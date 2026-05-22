/**
 * VaultEXP — Auth Service
 * ============================================================
 * All auth API calls go through this single file.
 * Uses the centralized `api` instance which always points to:
 *   NEXT_PUBLIC_API_URL/api  (Railway backend)
 *
 * Response shapes:
 *   POST /auth/login  → { success, token, user, data: { user, accessToken } }
 *   POST /auth/signup → { success, token, user }
 *   POST /auth/logout → { success, message }
 *   GET  /auth/me     → { success, data: { user } }
 */

import api from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────

export interface LoginCredentials {
  email:    string;
  password: string;
}

export interface SignupData {
  name:     string;
  email:    string;
  password: string;
}

export interface AuthUser {
  id:             string;
  name:           string;
  email:          string;
  role:           string;
  isApproved?:    boolean;
  isActive?:      boolean;
  clearanceLevel?: number;
  avatar?:        string;
}

export interface AuthResponse {
  success:   boolean;
  message?:  string;
  token?:    string;
  user?:     AuthUser;
  // Legacy nested shape (also returned by login for compatibility)
  data?: {
    user?:        AuthUser;
    accessToken?: string;
  };
}

// ── Login ─────────────────────────────────────────────────────────────
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
}

// ── Signup ────────────────────────────────────────────────────────────
export async function signup(userData: SignupData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/signup', userData);
  return response.data;
}

// ── Logout ────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore server error on logout — we always clear local state below
  } finally {
    // Clear encrypted storage safely regardless of network result
    if (typeof window !== 'undefined') {
      try {
        const { secureStorage } = require('@/lib/secureStorage');
        secureStorage.removeItem('vault-auth-storage');
      } catch {
        try { localStorage.removeItem('vault-auth-storage'); } catch { /* ignore */ }
      }
    }
  }
}

// ── Get current user ──────────────────────────────────────────────────
export async function getCurrentUser(): Promise<AuthResponse> {
  const response = await api.get<AuthResponse>('/auth/me');
  return response.data;
}

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * Extract token from any auth response shape.
 * Backend returns { token } (top-level) AND { data: { accessToken } } for compatibility.
 */
export function extractToken(res: AuthResponse): string | null {
  return res.token || res.data?.accessToken || null;
}

/**
 * Extract user from any auth response shape.
 */
export function extractUser(res: AuthResponse): AuthUser | null {
  return res.user || res.data?.user || null;
}

// ── Named export ──────────────────────────────────────────────────────
export const AuthService = {
  login,
  signup,
  logout,
  getCurrentUser,
  extractToken,
  extractUser,
};

export default AuthService;

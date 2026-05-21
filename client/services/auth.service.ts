/**
 * VaultEXP — Auth Service
 *
 * All authentication API calls go through this single service.
 * It uses the centralized `api` instance so requests ALWAYS hit
 * the Railway backend (NEXT_PUBLIC_API_URL), never a relative /api route.
 *
 * Backend response shapes:
 *   POST /auth/login  → { success, data: { user, accessToken } }
 *   POST /auth/signup → { success, token, user }
 *   POST /auth/logout → { success, message }
 *   GET  /auth/me     → { success, data: { user } }
 */

import api from '@/lib/api';

// ── Login ──────────────────────────────────────────────────────────
export async function login(credentials: { email: string; password: string }) {
  const response = await api.post('/auth/login', credentials);
  return response.data; // { success, data: { user, accessToken } }
}

// ── Signup ─────────────────────────────────────────────────────────
export async function signup(userData: {
  name: string;
  email: string;
  password: string;
}) {
  const response = await api.post('/auth/signup', userData);
  return response.data; // { success, token, user }
}

// ── Logout ─────────────────────────────────────────────────────────
export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    // Always clear local state, even if the server call fails
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vault-auth-storage');
    }
  }
}

// ── Get current user ───────────────────────────────────────────────
export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data; // { success, data: { user } }
}

// ── Named object export for convenience ───────────────────────────
export const AuthService = {
  login,
  signup,
  logout,
  getCurrentUser,
};

export default AuthService;

import axios from 'axios';

/**
 * VaultEXP — Centralized API Client
 *
 * SINGLE source of truth for all HTTP requests.
 * baseURL is set from NEXT_PUBLIC_API_URL at build time.
 * Falls back to the production Railway URL so the app is NEVER broken.
 *
 * The request interceptor reads the JWT from Zustand's persisted
 * localStorage key and injects it as Authorization: Bearer <token>.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://vaultexp-webapp-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ────────────────────────────────────────────
// Reads JWT from Zustand persisted storage and injects Bearer token.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      // Zustand persists to localStorage under 'vault-auth-storage'
      const raw = localStorage.getItem('vault-auth-storage');
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.token;
        if (token) {
          config.headers = config.headers ?? {};
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }

      // Inject optional workspace context header
      const workspaceId = localStorage.getItem('vault-workspace-id');
      if (workspaceId) {
        config.headers = config.headers ?? {};
        config.headers['x-workspace-id'] = workspaceId;
      }
    } catch (err) {
      console.warn('[API] Failed to inject auth token:', err);
    }
  }
  return config;
});

// ── Response Interceptor ───────────────────────────────────────────
// Aliases `id` → `_id` for MongoDB-era frontend code compatibility.
// Handles 401 by clearing session and redirecting to login.
function injectLegacyId(obj: any) {
  if (Array.isArray(obj)) {
    obj.forEach(injectLegacyId);
  } else if (obj !== null && typeof obj === 'object') {
    if (obj.id && !obj._id) obj._id = obj.id;
    Object.values(obj).forEach(injectLegacyId);
  }
}

api.interceptors.response.use(
  (response) => {
    if (response.data) injectLegacyId(response.data);
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isAuthPage =
        window.location.pathname.startsWith('/auth') ||
        window.location.pathname.includes('/login');
      if (!isAuthPage) {
        console.warn('[API] 401 Unauthorized — clearing session');
        localStorage.removeItem('vault-auth-storage');
        window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(
          window.location.pathname
        )}`;
      }
    } else if (!error.response && typeof window !== 'undefined') {
      console.error('[API] Network/Server Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ── Helpers ────────────────────────────────────────────────────────
/** Manually set or clear the Authorization header (called on login/logout). */
export const setAuthHeader = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export { api };
export default api;

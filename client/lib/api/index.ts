import axios, { type InternalAxiosRequestConfig } from 'axios';

/**
 * VaultEXP — Centralized API Client
 * ============================================================
 * Single source of truth for ALL HTTP requests to the Railway backend.
 *
 * Fix log:
 *  - "Unexpected token 'U'" was caused by the old interceptor doing
 *    a raw localStorage.getItem() on the encrypted secureStorage blob
 *    (XOR+Base64) and then calling JSON.parse() on it directly.
 *    The encrypted blob starts with a Base64 character ('U', 'e', etc.),
 *    not '{', so JSON.parse throws immediately.
 *
 *  - Fix: read token through the secureStorage API (which decrypts),
 *    then parse the decrypted JSON string to extract state.token.
 *
 *  - "Network Error" / "Blocked by CORS" is a Railway deployment issue
 *    (stale deploy). The backend code is correct — CORS headers verified
 *    locally. The fix is forcing a Railway redeploy.
 */

// ── Base URL ─────────────────────────────────────────────────────────
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://vaultexp-webapp-production.up.railway.app/api';

// ── Axios instance ────────────────────────────────────────────────────
const api = axios.create({
  baseURL:         API_BASE_URL,
  withCredentials: true,            // sends cookies cross-origin
  timeout:         15000,           // 15s timeout — prevents hanging requests
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});

// ── Token reader — reads through secureStorage (decrypts) ─────────────
/**
 * Reads the auth token from Zustand persisted storage.
 *
 * authStore uses secureStorage (XOR+Base64 obfuscation).
 * Reading via secureStorage.getItem() decrypts the blob first,
 * then we JSON.parse the plaintext Zustand state to get token.
 *
 * This fixes the "Unexpected token 'U'" crash that happened when
 * the old interceptor called JSON.parse directly on the encrypted blob.
 */
function readStoredToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // Import secureStorage dynamically to avoid SSR issues.
    // secureStorage.getItem decrypts the XOR+Base64 blob → returns plain JSON string.
    const { secureStorage } = require('@/lib/secureStorage') as {
      secureStorage: { getItem: (k: string) => string | null };
    };

    const decryptedJson = secureStorage.getItem('vault-auth-storage');
    if (!decryptedJson) return null;

    const parsed = JSON.parse(decryptedJson) as { state?: { token?: string } };
    return parsed?.state?.token ?? null;
  } catch {
    // If anything fails (corrupt storage, missing key), return null gracefully.
    // This means the request goes out without an Authorization header,
    // and the server returns 401 — which is the correct behavior.
    return null;
  }
}

// ── Request interceptor ───────────────────────────────────────────────
// Injects Bearer token and optional workspace header on every request.

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = readStoredToken();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Inject optional workspace context header
    if (typeof window !== 'undefined') {
      try {
        const workspaceId = localStorage.getItem('vault-workspace-id');
        if (workspaceId) {
          config.headers = config.headers ?? {};
          config.headers['x-workspace-id'] = workspaceId;
        }
      } catch {
        // ignore
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────
// Handles 401 (clear session + redirect) and network errors gracefully.

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (typeof window !== 'undefined') {
      if (status === 401) {
        // Only redirect to login if not already on an auth page
        const isAuthPage =
          window.location.pathname.startsWith('/auth') ||
          window.location.pathname === '/';

        if (!isAuthPage) {
          console.warn('[API] 401 — session expired, redirecting to login');
          // Clear encrypted storage via secureStorage to avoid stale tokens
          try {
            const { secureStorage } = require('@/lib/secureStorage');
            secureStorage.removeItem('vault-auth-storage');
          } catch {
            localStorage.removeItem('vault-auth-storage');
          }
          window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(
            window.location.pathname
          )}`;
        }
      } else if (!error.response) {
        // Network error (no response at all) — Railway may be deploying
        console.error('[API] Network error:', error.message, '— URL:', API_BASE_URL);
      }
    }

    return Promise.reject(error);
  }
);

// ── Manual auth header helper ─────────────────────────────────────────
/**
 * Call after login/logout to immediately update the Authorization header
 * without waiting for the next request interceptor run.
 */
export const setAuthHeader = (token: string | null): void => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export { api };
export default api;

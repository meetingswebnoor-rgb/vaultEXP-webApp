import axios, { type InternalAxiosRequestConfig } from 'axios';

/**
 * VaultEXP — Centralized API Client
 * ============================================================
 * ALL HTTP requests to the Railway backend go through this file.
 *
 * WHAT WAS BROKEN (and why):
 *
 * 1. "Unexpected token 'U'" — JSON parse crash
 *    authStore persists to localStorage via secureStorage, which
 *    XOR-encrypts and Base64-encodes the state before storing.
 *    The old interceptor did:
 *      JSON.parse(localStorage.getItem('vault-auth-storage'))
 *    but that returns the encrypted blob ("U2FsdGVk..."), not JSON.
 *    JSON.parse("U2Fsl...") throws "Unexpected token 'U'".
 *
 *    FIX: Read through secureStorage.getItem() which decrypts first,
 *    then guard every JSON.parse with try/catch.
 *
 * 2. Authorization injection crash
 *    Old code did:
 *      config.headers.Authorization = `Bearer ${token}`;
 *    without checking if token was defined.
 *
 *    FIX: Always guard — only set header if token is a non-empty string.
 *
 * 3. CORS "Network Error"
 *    withCredentials: true requires backend to set
 *    Access-Control-Allow-Credentials: true AND a specific origin
 *    (not wildcard). Backend CORS is now correctly configured.
 *    withCredentials is kept because auth uses JWT in Authorization
 *    header (not cookies), so it's harmless but consistent.
 *
 * HOW TO ADD A NEW ALLOWED DOMAIN IN FUTURE:
 *    Add it to allowedOrigins[] in server/src/app.js — no frontend change needed.
 */

// ── Base URL ──────────────────────────────────────────────────────────
export const API_BASE_URL: string =
  (process.env.NEXT_PUBLIC_API_URL || 'https://vaultexp-webapp-production.up.railway.app') + '/api';

// ── Axios instance ─────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
  // withCredentials sends cookies cross-origin.
  // We use JWT in Authorization header (not cookies), but this is kept
  // for future cookie-based refresh tokens and consistency.
  withCredentials: true,
});

// ── Safe token reader ─────────────────────────────────────────────────
/**
 * Safely reads the auth token from Zustand persisted storage.
 *
 * authStore uses secureStorage (XOR+Base64 obfuscation). Reading
 * raw localStorage gives the encrypted blob — NOT valid JSON.
 * We must call secureStorage.getItem() which decrypts it first.
 *
 * Every step is wrapped in try/catch so a corrupt or missing token
 * never crashes the interceptor.
 */
function readStoredToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // Step 1 — get the raw value from localStorage
    const raw = localStorage.getItem('vault-auth-storage');
    if (!raw) return null;

    // Step 2 — attempt secure decryption via secureStorage
    let jsonString: string | null = null;
    try {
      // secureStorage.getItem decrypts the XOR+Base64 blob → plain JSON string
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { secureStorage } = require('@/lib/secureStorage') as {
        secureStorage: { getItem: (k: string) => string | null };
      };
      jsonString = secureStorage.getItem('vault-auth-storage');
    } catch {
      // secureStorage unavailable — fall back to raw value
      // (handles old plain-text format from before encryption was added)
      jsonString = raw;
    }

    if (!jsonString) return null;

    // Step 3 — safe JSON parse (never throw to the interceptor)
    try {
      const parsed = JSON.parse(jsonString) as { state?: { token?: string } };
      const token = parsed?.state?.token;
      // Return only if it's a non-empty string
      return typeof token === 'string' && token.length > 0 ? token : null;
    } catch {
      // jsonString was not valid JSON — storage is corrupt, return null
      return null;
    }
  } catch {
    return null;
  }
}

// ── Request interceptor ───────────────────────────────────────────────
// Injects Bearer token on every request. Safe — never throws.

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Read token safely
    const token = readStoredToken();

    // Only set Authorization header if token exists and is non-empty
    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Inject optional workspace context header
    try {
      if (typeof window !== 'undefined') {
        const workspaceId = localStorage.getItem('vault-workspace-id');
        if (workspaceId && typeof workspaceId === 'string') {
          config.headers = config.headers ?? {};
          config.headers['x-workspace-id'] = workspaceId;
        }
      }
    } catch {
      // ignore localStorage errors silently
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────
// Handles 401 session expiry and network errors.

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const status = error?.response?.status;

      if (status === 401) {
        const isAuthPage =
          window.location.pathname.startsWith('/auth') ||
          window.location.pathname === '/';

        if (!isAuthPage) {
          console.warn('[API] Session expired — redirecting to login');
          // Clear storage safely
          try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { secureStorage } = require('@/lib/secureStorage');
            secureStorage.removeItem('vault-auth-storage');
          } catch {
            try { localStorage.removeItem('vault-auth-storage'); } catch { /* ignore */ }
          }
          window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(
            window.location.pathname
          )}`;
        }
      } else if (!error.response) {
        console.error('[API] Network error — backend unreachable:', error.message);
        console.error('[API] Target URL:', API_BASE_URL);
      }
    }

    return Promise.reject(error);
  }
);

// ── Manual auth header helper ─────────────────────────────────────────
/** Call immediately after login to inject token without waiting for next request. */
export const setAuthHeader = (token: string | null): void => {
  if (token && typeof token === 'string' && token.length > 0) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export { api };
export default api;

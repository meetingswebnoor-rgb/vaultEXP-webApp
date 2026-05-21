import axios from 'axios';
import { secureStorage } from '../secureStorage';

/**
 * API Client for VaultEXP
 *
 * Uses an EMPTY baseURL so all requests are relative to the current page origin.
 * The Next.js proxy in next.config.js forwards /api/* → http://localhost:5000/api/*
 * This completely avoids CORS issues in development.
 *
 * In production, set NEXT_PUBLIC_API_URL and update the proxy/rewrites accordingly.
 */
export const api = axios.create({
  baseURL: '',  // Relative — goes through Next.js proxy
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Reads the JWT access token from zustand's persisted localStorage
 * and injects it as an Authorization: Bearer header on every request.
 */
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const raw = secureStorage.getItem('vault-auth-storage');
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.token;
        
        if (token) {
          // Use .set() if available (Axios 1.0+), otherwise direct assignment
          if (config.headers && typeof config.headers.set === 'function') {
            config.headers.set('Authorization', `Bearer ${token}`);
          } else {
            config.headers = config.headers ?? {};
            (config.headers as any)['Authorization'] = `Bearer ${token}`;
          }
        }
      }
      
      const workspaceId = localStorage.getItem('vault-workspace-id');
      if (workspaceId) {
        if (config.headers && typeof config.headers.set === 'function') {
          config.headers.set('x-workspace-id', workspaceId);
        } else {
          config.headers = config.headers ?? {};
          (config.headers as any)['x-workspace-id'] = workspaceId;
        }
      }
    } catch (err) {
      console.warn('[API] Failed to inject auth token:', err);
    }
  }
  return config;
});

/**
 * setAuthHeader
 * Manually set or remove the Authorization header.
 * Called by the authStore on login/logout.
 */
export const setAuthHeader = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

/**
 * Response Interceptor
 * Recursively aliases `id` to `_id` in API responses to maintain compatibility
 * with legacy MongoDB frontend code after migrating to Prisma/MySQL.
 */
function injectLegacyId(obj: any) {
  if (Array.isArray(obj)) {
    obj.forEach(injectLegacyId);
  } else if (obj !== null && typeof obj === 'object') {
    if (obj.id && !obj._id) {
      obj._id = obj.id;
    }
    Object.values(obj).forEach(injectLegacyId);
  }
}

api.interceptors.response.use(
  (response) => {
    if (response.data) {
      injectLegacyId(response.data);
    }
    return response;
  },
  (error) => {
    // If we get a 401 and we're on the client, clear auth and redirect
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isAuthPage = window.location.pathname.startsWith('/auth');
      
      if (!isAuthPage) {
        console.warn('[API] 401 Unauthorized - clearing session');
        secureStorage.removeItem('vault-auth-storage');
        window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    return Promise.reject(error);
  }
);

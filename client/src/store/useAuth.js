/**
 * useAuth.js
 * Legacy compatibility shim.
 * Re-exports the canonical auth store from @/store/authStore.
 * 
 * All new code should import from: @/store/authStore
 */
export { useAuthStore as default, useAuthStore } from '@/store/authStore';

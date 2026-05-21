/**
 * Enterprise Secure Storage
 *
 * Provides a synchronous obfuscation layer over localStorage to prevent
 * plaintext token leakage in the browser's developer tools.
 *
 * Uses a lightweight XOR+Base64 cipher. Zustand's createJSONStorage requires
 * synchronous access so we cannot use async Web Crypto API here.
 *
 * RESILIENCE: All methods are fully wrapped in try/catch.
 * A read failure silently returns null (store initializes as unauthenticated).
 * A write failure is logged but does not crash the application.
 */

const ENCRYPTION_KEY = 'vault_exp_secure_key_2026';

function xorEncryptDecrypt(input: string, key: string): string {
  let output = '';
  for (let i = 0; i < input.length; i++) {
    output += String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return output;
}

export const secureStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(name);
      if (!raw) return null;

      // Try to decrypt (XOR+Base64 format)
      try {
        const decoded = atob(raw);
        const decrypted = xorEncryptDecrypt(decoded, ENCRYPTION_KEY);
        // Decode URI component to safely parse original UTF-8 characters
        return decodeURIComponent(decrypted);
      } catch {
        // If decryption fails (e.g., plain JSON from an older format),
        // fall back to returning raw value so Zustand can still parse it.
        // This handles migrations gracefully.
        return raw;
      }
    } catch (e) {
      // localStorage access denied (e.g., private browsing restrictions)
      return null;
    }
  },

  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      // Encode URI component to safely handle UTF-8 characters before XOR and btoa
      const encodedValue = encodeURIComponent(value);
      const encrypted = xorEncryptDecrypt(encodedValue, ENCRYPTION_KEY);
      const encoded = btoa(encrypted);
      localStorage.setItem(name, encoded);
    } catch (e) {
      // Storage quota exceeded or access denied — fail gracefully
      console.warn('[VaultStorage] Write failed:', e);
    }
  },

  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(name);
    } catch {
      // Silently ignore
    }
  },
};

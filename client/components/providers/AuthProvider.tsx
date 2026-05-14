'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * AuthProvider
 * Marks the auth store as hydrated after mount.
 * Since we use localStorage persistence (no refresh token),
 * zustand/persist automatically restores the session on load.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    // Zustand persist handles rehydration automatically.
    // We just need to mark the store as hydrated so guards can render.
    setHydrated();
  }, [setHydrated]);

  return <>{children}</>;
}

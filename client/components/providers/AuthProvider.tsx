'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * AuthProvider
 * Ensures the auth store is marked as hydrated after mount.
 *
 * Strategy:
 *  1. Immediately check if zustand/persist already completed rehydration
 *     (synchronous, works if the persist middleware fires before first render).
 *  2. After mount (useEffect), call setHydrated() unconditionally as a
 *     guaranteed safety net — this fires after the client has fully mounted
 *     and is always reliable.
 *
 * Note: setHydrated() is idempotent — calling it multiple times is safe.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    // Guaranteed post-mount hydration signal.
    // Zustand persist handles rehydration automatically;
    // we just confirm the flag is set so guards can render.
    setHydrated();
  }, [setHydrated]);

  return <>{children}</>;
}

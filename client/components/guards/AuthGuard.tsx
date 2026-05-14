'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

/**
 * AuthGuard
 * Wraps every authenticated route. Reads from the canonical zustand store.
 * - If not authenticated → redirect to /auth/login with callbackUrl.
 * - While hydrating → show a loading spinner (avoids flash redirect).
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isHydrated, token, setHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If the store is already hydrated but the flag is false, sync it.
    // This can happen if the onRehydrateStorage callback didn't run for some reason.
    if (!isHydrated && useAuthStore.persist?.hasHydrated()) {
      setHydrated();
    }
  }, [isHydrated, setHydrated]);

  useEffect(() => {
    // Only redirect after the store has been hydrated from localStorage.
    if (isHydrated && !isAuthenticated && !token) {
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isHydrated, isAuthenticated, token, router, pathname]);

  // Show spinner while Zustand is rehydrating from localStorage
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-vault-darker flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-vault-green/20 border-t-vault-green rounded-full animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Initializing Vault...</p>
          <p className="text-white/20 text-xs max-w-[200px]">Securing your connection to the financial mesh</p>
        </div>
      </div>
    );
  }

  // After hydration: if not authenticated, show redirect spinner
  if (!isAuthenticated && !token) {
    return (
      <div className="min-h-screen bg-vault-darker flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-vault-green/20 border-t-vault-green rounded-full animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
  minimumClearance?: number;
  loginUrl: string;
}

/**
 * RoleGuard
 * Works in tandem with AuthGuard or independently.
 * Checks if the current user has the required role.
 * If unauthorized, renders a 403 Access Denied UI.
 * If unauthenticated, AuthGuard will handle the redirect, but RoleGuard can also redirect to the specific portal login.
 */
export function RoleGuard({ children, allowedRoles, minimumClearance, loginUrl }: RoleGuardProps) {
  const { isAuthenticated, isHydrated, user, token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not authenticated, redirect to specific portal login
    if (isHydrated && !isAuthenticated && !token) {
      router.replace(`${loginUrl}?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isHydrated, isAuthenticated, token, router, pathname, loginUrl]);

  if (!isHydrated) {
    return null; // Let AuthGuard render the spinner
  }

  if (!isAuthenticated && !token) {
    return null; // Will redirect
  }

  // Check roles or clearance
  let isAuthorized = false;
  
  if (user) {
    const clearanceMap: Record<string, number> = {
      SUPER_ADMIN: 10,
      ADMIN: 7,
      CLIENT: 3,
      USER: 1
    };
    
    const actualClearance = Math.max(user.clearanceLevel || 0, clearanceMap[user.role] || 0);

    if (minimumClearance !== undefined) {
      isAuthorized = user.role === 'SUPER_ADMIN' || actualClearance >= minimumClearance;
    } else if (allowedRoles) {
      isAuthorized = user.role === 'SUPER_ADMIN' || allowedRoles.includes(user.role);
    } else {
      isAuthorized = true; // Fallback if no restriction provided
    }
  }

  if (user && !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0A0F14] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">403: Access Denied</h1>
        <p className="text-gray-400 max-w-md mb-8">
          Your current security clearance (Level {user.clearanceLevel || 0} / {user.role}) does not grant access to this sector. 
          Please authenticate with authorized credentials.
        </p>
        <button 
          onClick={() => router.push(loginUrl)}
          className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 rounded-xl transition-colors"
        >
          Switch Account
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

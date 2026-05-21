'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function AutoRedirect() {
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && isAuthenticated && user) {
      if (user.role === 'SUPER_ADMIN') {
        router.replace('/admin/dashboard');
      } else if (user.role === 'CLIENT') {
        router.replace('/client/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isHydrated, isAuthenticated, user, router]);

  return null;
}

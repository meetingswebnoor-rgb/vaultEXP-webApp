'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { SocketProvider } from '@/components/providers/SocketProvider';
import { BackgroundSyncWorker } from '@/components/sync/BackgroundSyncWorker';

/**
 * Global providers wrapper — React 19 + TanStack Query v5 compatible
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes (aggressive caching to save mobile battery/bandwidth)
            gcTime: 30 * 60 * 1000, // Keep in garbage collection for 30 mins
            refetchOnWindowFocus: false,
            refetchOnReconnect: 'always',
            retry: (failureCount, error: any) => {
              // Exponential backoff up to 3 retries, skip retrying 400s
              if (error?.status === 401 || error?.status === 403 || error?.status === 404) return false;
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <SocketProvider>
              <BackgroundSyncWorker />
              {children}
            </SocketProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

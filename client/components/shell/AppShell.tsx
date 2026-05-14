'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AppShellProvider } from './AppShellContext';
import { AppShellInner } from './AppShellInner';
import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

/**
 * AppShell — the authenticated layout wrapper for ALL dashboard pages.
 *
 * Responsibility boundary:
 *  - Mounts the AppShellProvider (global shell state)
 *  - On route change → collapses all open popovers/sheets via AppShellInner
 *  - Delegates visual rendering to AppShellInner (responsive layout picker)
 *
 * Usage (app/(dashboard)/layout.tsx):
 *  ```tsx
 *  <AppShell>{children}</AppShell>
 *  ```
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <AppShellProvider>
      <AppShellInner>{children}</AppShellInner>
    </AppShellProvider>
  );
}

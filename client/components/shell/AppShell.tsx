'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AppShellProvider } from './AppShellContext';
import { AppShellInner } from './AppShellInner';
import type { ReactNode } from 'react';
import { api } from '@/lib/api';

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
  const [wsBrandConfig, setWsBrandConfig] = useState<any>(null);

  useEffect(() => {
    // In a real implementation, fetch based on active workspace ID.
    setWsBrandConfig({
      primaryColor: '#00FF88', // Default vault-green
      sidebarColor: '#0A0F14'  // Default dark glass
    });
  }, []);

  const styleObj = {
    '--ws-primary': wsBrandConfig?.primaryColor || '#00FF88',
    '--ws-sidebar': wsBrandConfig?.sidebarColor || '#0A0F14',
  } as React.CSSProperties;

  return (
    <div style={styleObj} className="contents">
      <AppShellProvider>
        <AppShellInner>{children}</AppShellInner>
      </AppShellProvider>
    </div>
  );
}

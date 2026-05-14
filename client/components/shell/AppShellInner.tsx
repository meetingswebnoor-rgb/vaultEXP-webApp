'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAppShell } from './AppShellContext';
import { MobileDashboard } from '@/components/layouts/MobileDashboard';
import { DesktopDashboard } from '@/components/layouts/DesktopDashboard';
import { LayoutSkeleton } from '@/components/layouts/LayoutSkeleton';
import type { ReactNode } from 'react';

interface AppShellInnerProps {
  children: ReactNode;
}

/**
 * AppShellInner — the responsive layout dispatcher.
 *
 * Sits inside AppShellProvider so it can read and write shell state.
 *
 * Routing logic:
 *   mobile  (<768px)  → MobileDashboard  (header + scrollable main + bottom nav + FAB)
 *   tablet  (768–1024)→ MobileDashboard  (wider variant)
 *   desktop (>1024px) → DesktopDashboard (sidebar + topbar + scrollable main)
 *
 * Additionally:
 *   - On every pathname change, collapses all open overlays (drawer, FAB sheet,
 *     notification panel) to avoid stale UI state across navigation.
 *   - During SSR / first hydration tick, renders a neutral LayoutSkeleton to
 *     prevent layout flash and hydration mismatches.
 */
export function AppShellInner({ children }: AppShellInnerProps) {
  const pathname = usePathname();
  const { isReady, isMobileOrTablet } = useBreakpoint();
  const { closeAll } = useAppShell();

  // Collapse all shell overlays on route change
  useEffect(() => {
    closeAll();
  }, [pathname, closeAll]);

  // Prevent hydration mismatch — render neutral skeleton during SSR
  if (!isReady) return <LayoutSkeleton />;

  return isMobileOrTablet
    ? <MobileDashboard>{children}</MobileDashboard>
    : <DesktopDashboard>{children}</DesktopDashboard>;
}

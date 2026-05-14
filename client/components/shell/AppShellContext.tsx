'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface AppShellState {
  /** Desktop sidebar collapsed state */
  sidebarCollapsed: boolean;
  /** Mobile profile drawer open state */
  drawerOpen: boolean;
  /** Mobile FAB action sheet open state */
  fabOpen: boolean;
  /** Desktop/mobile notifications panel open state */
  notificationsOpen: boolean;
}

interface AppShellActions {
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  openFab: () => void;
  closeFab: () => void;
  toggleFab: () => void;
  openNotifications: () => void;
  closeNotifications: () => void;
  toggleNotifications: () => void;
  /** Dismiss all popovers at once (useful on route change) */
  closeAll: () => void;
}

type AppShellContextValue = AppShellState & AppShellActions;

// ── Context ────────────────────────────────────────────────────────────────────

const AppShellContext = createContext<AppShellContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────────

interface AppShellProviderProps {
  children: ReactNode;
  /** Initial sidebar collapsed state — can be driven by persisted preference */
  initialSidebarCollapsed?: boolean;
}

export function AppShellProvider({
  children,
  initialSidebarCollapsed = false,
}: AppShellProviderProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialSidebarCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const closeAll = useCallback(() => {
    setDrawerOpen(false);
    setFabOpen(false);
    setNotificationsOpen(false);
  }, []);

  const value = useMemo<AppShellContextValue>(
    () => ({
      // State
      sidebarCollapsed,
      drawerOpen,
      fabOpen,
      notificationsOpen,
      // Sidebar
      setSidebarCollapsed,
      toggleSidebar: () => setSidebarCollapsed((v) => !v),
      // Drawer
      openDrawer:  () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      toggleDrawer: () => setDrawerOpen((v) => !v),
      // FAB
      openFab:  () => setFabOpen(true),
      closeFab: () => setFabOpen(false),
      toggleFab: () => setFabOpen((v) => !v),
      // Notifications
      openNotifications:  () => setNotificationsOpen(true),
      closeNotifications: () => setNotificationsOpen(false),
      toggleNotifications: () => setNotificationsOpen((v) => !v),
      // Global
      closeAll,
    }),
    [sidebarCollapsed, drawerOpen, fabOpen, notificationsOpen, closeAll]
  );

  return (
    <AppShellContext.Provider value={value}>
      {children}
    </AppShellContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────

/**
 * useAppShell — access AppShell state and actions from any descendant.
 *
 * @throws If used outside of <AppShellProvider>
 */
export function useAppShell(): AppShellContextValue {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error('useAppShell must be used inside <AppShellProvider>');
  }
  return ctx;
}

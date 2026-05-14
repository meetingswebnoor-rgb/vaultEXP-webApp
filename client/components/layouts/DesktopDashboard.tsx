'use client';

import { motion } from 'framer-motion';
import { DesktopSidebar } from '@/components/desktop/DesktopSidebar';
import { DesktopTopbar } from '@/components/desktop/DesktopTopbar';
import { useAppShell } from '@/components/shell/AppShellContext';

interface DesktopDashboardProps {
  children: React.ReactNode;
}

/**
 * DesktopDashboard — Premium SaaS-style layout
 */
export function DesktopDashboard({ children }: DesktopDashboardProps) {
  const { sidebarCollapsed, toggleSidebar } = useAppShell();

  return (
    <div className="flex h-screen bg-vault-darker overflow-hidden text-white">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <DesktopSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={toggleSidebar} 
      />

      {/* ── Right Panel ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-vault-green/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] pointer-events-none" />

        {/* Topbar */}
        <DesktopTopbar sidebarCollapsed={sidebarCollapsed} />

        {/* Content */}
        <main
          id="desktop-main-content"
          className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

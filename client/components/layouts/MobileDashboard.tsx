'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, LogOut, User, Settings } from 'lucide-react';
import Link from 'next/link';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { useAuthStore } from '@/store/authStore';
import { useAppShell } from '@/components/shell/AppShellContext';
import { cn } from '@/lib/utils/cn';
import { VaultAIOrb } from '@/components/branding/VaultAIOrb';
import { SidebarLogo } from '@/components/dashboard/sidebar/SidebarLogo';
import { VaultAISidebar } from '@/components/ai/VaultAISidebar';
import { FloatingAIOrb } from '@/components/ai/FloatingAIOrb';
import { MobileUploadSheet } from '@/components/mobile/MobileUploadSheet';
import { MobileQuickActionsFAB } from '@/components/mobile/MobileQuickActionsFAB';
import { MobileStackRouter } from '@/components/layouts/MobileStackRouter';

import { MAIN_NAV } from '@/config/navigation';

/** Returns a time-of-day greeting */
function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

interface MobileDashboardProps {
  children: React.ReactNode;
}

/**
 * MobileDashboard — Native fintech app shell
 *
 *  ┌────────────────────────┐
 *  │  MobileHeader          │  fixed top
 *  ├────────────────────────┤
 *  │                        │
 *  │  children (scrollable) │  flex-1, momentum scroll
 *  │                        │
 *  ├────────────────────────┤
 *  │  MobileBottomNav       │  fixed bottom w/ FAB
 *  └────────────────────────┘
 */
export function MobileDashboard({ children }: MobileDashboardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isTablet } = useBreakpoint();
  const {
    drawerOpen,
    openDrawer,
    closeDrawer,
    fabOpen,
    openFab,
    closeFab,
  } = useAppShell();

  return (
    <div className="flex flex-col h-screen bg-vault-darker overflow-hidden">
      {/* Global AI Assistant */}
      <VaultAISidebar />
      <FloatingAIOrb />

      {/* ── Ambient background blobs ──────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-80px] left-[-60px] w-64 h-64 rounded-full
                        bg-vault-green/5 blur-[80px]" />
        <div className="absolute bottom-24 right-[-40px] w-48 h-48 rounded-full
                        bg-indigo-500/5 blur-[60px]" />
      </div>

      {/* ── Header ─────────────────────────────────────────── */}
      <MobileHeader
        userName={user?.name}
        greeting={
          pathname.includes('/profile')
            ? 'Account'
            : pathname.includes('/ai')
            ? 'VaultAI'
            : getTimeGreeting()
        }
        onAvatarPress={openDrawer}
        onNotificationPress={() => router.push('/notifications')}
        onScanPress={() => {}}
      />

      {/* ── Scrollable Content ──────────────────────────────── */}
      <main
        id="mobile-main-content"
        className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain relative z-10 pb-6"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <MobileStackRouter>
          {children}
        </MobileStackRouter>
      </main>

      {/* ── Floating AI & Quick Actions ────────────────────────── */}
      <MobileQuickActionsFAB />
      <MobileUploadSheet />
      <FloatingAIOrb />

      {/* ── Bottom Nav ──────────────────────────────────────── */}
      <MobileBottomNav onFabPress={openFab} />

      {/* ── Profile Drawer ──────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="drawer-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={closeDrawer}
            />

            {/* Drawer */}
            <motion.aside
              key="drawer-panel"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className={cn(
                'fixed top-0 left-0 bottom-0 z-50 flex flex-col',
                'bg-[#0A0F14]/80 backdrop-blur-[20px] border-r border-white/[0.05]',
                isTablet ? 'w-80' : 'w-[85vw] max-w-[320px]'
              )}
            >
              {/* Drawer ambient background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-20%] w-64 h-64 bg-vault-green/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-20%] w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-8 pb-4 relative z-10">
                <SidebarLogo collapsed={false} />
                <motion.button
                  id="drawer-close-btn"
                  whileTap={{ scale: 0.88 }}
                  onClick={closeDrawer}
                  className="h-10 w-10 rounded-2xl bg-white/[0.03] border border-white/[0.08]
                             flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* User card */}
              <div className="px-5 py-4 relative z-10">
                <div className="flex items-center gap-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] p-4 shadow-xl">
                  <div className="h-12 w-12 rounded-xl bg-vault-green/10 border border-vault-green/20
                                  flex items-center justify-center text-vault-green text-sm font-bold
                                  shadow-[0_0_15px_rgba(0,255,136,0.15)]">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'V'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-white truncate">{user?.name || 'Vault Member'}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user?.email || 'No email set'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] font-black tracking-widest text-vault-green border border-vault-green/30
                                     bg-vault-green/10 rounded-full px-2 py-0.5 shadow-[0_0_8px_rgba(0,255,136,0.2)]">
                      {user?.role?.toUpperCase() || 'USER'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-2 relative z-10 custom-scrollbar">
                {MAIN_NAV.map(({ href, label, icon: Icon, isAI }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeDrawer}
                      className={cn(
                        'group relative flex items-center justify-between rounded-2xl px-5 py-3.5 transition-all duration-300',
                        active
                          ? 'text-vault-green'
                          : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                      )}
                    >
                      {active && (
                        <div className="absolute inset-0 rounded-2xl bg-vault-green/5 border border-vault-green/10 shadow-[inset_0_0_12px_rgba(0,255,136,0.05)]" />
                      )}
                      <div className="flex items-center gap-4 relative z-10">
                        {isAI ? (
                          <div className="relative">
                            <VaultAIOrb size={20} glow={active} animated={active} compact={true} />
                          </div>
                        ) : (
                          <Icon size={19} className={active ? 'text-vault-green' : 'text-gray-500 group-hover:text-white'} />
                        )}
                        <span className="text-[14px] font-semibold">{label}</span>
                      </div>
                      <ChevronRight size={14} className={active ? 'text-vault-green' : 'text-gray-600 group-hover:text-white'} />
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="px-4 py-6 border-t border-white/[0.05] space-y-2 relative z-10">
                <Link
                  href="/profile"
                  onClick={closeDrawer}
                  className="flex items-center gap-4 rounded-xl px-5 py-3 text-sm text-gray-400
                             hover:bg-white/[0.03] hover:text-white transition-all"
                >
                  <User size={16} />
                  <span className="font-medium">My Profile</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={closeDrawer}
                  className="flex items-center gap-4 rounded-xl px-5 py-3 text-sm text-gray-400
                             hover:bg-white/[0.03] hover:text-white transition-all"
                >
                  <Settings size={16} />
                  <span className="font-medium">Settings</span>
                </Link>
                <button
                  id="drawer-logout-btn"
                  onClick={() => {
                    closeDrawer();
                    logout();
                  }}
                  className="w-full flex items-center gap-4 rounded-xl px-5 py-3 text-sm text-red-400/80
                             hover:bg-red-500/10 hover:text-red-400 transition-all font-semibold"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── FAB Action Sheet ────────────────────────────────── */}
      <AnimatePresence>
        {fabOpen && (
          <>
            <motion.div
              key="fab-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={closeFab}
            />
            <motion.div
              key="fab-sheet"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl
                         bg-vault-dark border-t border-vault-border p-6"
            >
              {/* Handle */}
              <div className="w-10 h-1 rounded-full bg-vault-border mx-auto mb-5" />

              <h3 className="font-display text-lg font-bold text-white mb-4 text-center">
                Quick Add
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'New Vault',     color: '#00FF88' },
                  { label: 'New Entry',     color: '#818CF8' },
                  { label: 'Transfer',      color: '#3B82F6' },
                  { label: 'Invite Member', color: '#F97316' },
                ].map((item) => (
                  <motion.button
                    key={item.label}
                    whileTap={{ scale: 0.93 }}
                    onClick={closeFab}
                    className="rounded-2xl py-4 text-sm font-semibold text-white
                               bg-vault-card border border-vault-border
                               hover:border-opacity-60 transition-all"
                    style={{ borderColor: `${item.color}30` }}
                  >
                    <div className="h-2 w-2 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                    {item.label}
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={closeFab}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-400
                           bg-vault-card border border-vault-border hover:text-white transition-all"
              >
                Cancel
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

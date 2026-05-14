'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, LogOut, User, Settings } from 'lucide-react';
import Link from 'next/link';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { useAuthStore } from '@/store/authStore';
import useAuth from '@/src/store/useAuth';
import { useAppShell } from '@/components/shell/AppShellContext';
import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview'  },
  { href: '/investment',label: 'Investments'},
  { href: '/business',  label: 'Businesses'},
  { href: '/property',  label: 'Properties'  },
  { href: '/wallet',    label: 'Wallet'   },
];

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
  const { user, logout } = useAuth();
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
        onNotificationPress={() => {}}
        onScanPress={() => {}}
      />

      {/* ── Scrollable Content ──────────────────────────────── */}
      <main
        id="mobile-main-content"
        className="flex-1 overflow-y-auto overscroll-contain relative z-10 pb-6"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

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
                'bg-vault-dark border-r border-vault-border',
                isTablet ? 'w-72' : 'w-[80vw] max-w-[300px]'
              )}
            >
              {/* Drawer top glow */}
              <div className="absolute top-0 left-0 right-0 h-px
                              bg-gradient-to-r from-transparent via-vault-green/30 to-transparent" />

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-5 border-b border-vault-border">
                <span className="font-display text-lg font-bold text-gradient">VaultEXP</span>
                <motion.button
                  id="drawer-close-btn"
                  whileTap={{ scale: 0.88 }}
                  onClick={closeDrawer}
                  className="h-8 w-8 rounded-xl bg-vault-card border border-vault-border
                             flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X size={15} />
                </motion.button>
              </div>

              {/* User card */}
              <div className="px-4 py-4 border-b border-vault-border">
                <div className="flex items-center gap-3 rounded-2xl bg-vault-card/60 border border-vault-border p-3">
                  <div className="h-11 w-11 rounded-full bg-vault-green/20 border-2 border-vault-green/40
                                  flex items-center justify-center text-vault-green text-sm font-bold
                                  shadow-[0_0_12px_rgba(0,255,136,0.2)]">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'V'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user?.name || 'Vault Member'}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user?.email || 'No email set'}</p>
                  </div>
                  <span className="text-[9px] font-bold text-vault-green border border-vault-green/30
                                   bg-vault-green/10 rounded-full px-2 py-0.5">
                    {user?.role?.toUpperCase() || 'USER'}
                  </span>
                </div>
              </div>

              {/* Nav */}
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {NAV_ITEMS.map(({ href, label }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeDrawer}
                      className={cn(
                        'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all',
                        active
                          ? 'bg-vault-green/12 text-vault-green border border-vault-green/20'
                          : 'text-gray-400 hover:bg-vault-card hover:text-white'
                      )}
                    >
                      {label}
                      <ChevronRight size={14} className={active ? 'text-vault-green' : 'text-gray-600'} />
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="px-3 py-4 border-t border-vault-border space-y-1">
                <Link
                  href="/profile"
                  onClick={closeDrawer}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400
                             hover:bg-vault-card hover:text-white transition-all"
                >
                  <User size={15} />
                  <span>My Profile</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={closeDrawer}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400
                             hover:bg-vault-card hover:text-white transition-all"
                >
                  <Settings size={15} />
                  <span>Settings</span>
                </Link>
                <button
                  id="drawer-logout-btn"
                  onClick={() => {
                    closeDrawer();
                    logout();
                  }}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400
                             hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={15} />
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

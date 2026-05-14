'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search, Bell, ChevronRight, ChevronDown,
  Settings, LogOut, User, Command,
  CheckCheck, X,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils/cn';

// ── Page title map ─────────────────────────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  '/dashboard':              'Overview',
  '/dashboard/businesses':   'Businesses',
  '/dashboard/property':     'Properties',
  '/dashboard/investments':  'Investments',
  '/dashboard/wallet':       'Wallet',
  '/dashboard/documents':    'Documents',
  '/dashboard/calendar':     'Calendar',
  '/dashboard/ai':           'Vault AI',
  '/dashboard/settings':     'Settings',
  '/dashboard/profile':      'Profile',
};

// ── Notifications data ─────────────────────────────────────────────────────────
const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Vault limit approaching',
    sub: 'Business Assets Q1 is at 90%',
    time: '2m ago',
    dot: '#F59E0B',
    unread: true,
  },
  {
    id: 2,
    title: 'New member joined',
    sub: 'Sarah K. joined Property Portfolio',
    time: '1h ago',
    dot: '#00FF88',
    unread: true,
  },
  {
    id: 3,
    title: 'Export ready',
    sub: 'Q2 Finance Report is ready to download',
    time: '3h ago',
    dot: '#60A5FA',
    unread: false,
  },
  {
    id: 4,
    title: 'Investment update',
    sub: 'Portfolio gained +4.2% this week',
    time: '1d ago',
    dot: '#00FF88',
    unread: false,
  },
];

// ── Dropdown animation ─────────────────────────────────────────────────────────
const dropdownVariants = {
  hidden:  { opacity: 0, y: 6, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', damping: 26, stiffness: 380 } },
  exit:    { opacity: 0, y: 4, scale: 0.97,
    transition: { duration: 0.12 } },
};

// ── Props ──────────────────────────────────────────────────────────────────────
interface DesktopTopbarProps {
  sidebarCollapsed: boolean;
}

export function DesktopTopbar({ sidebarCollapsed }: DesktopTopbarProps) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, clearAuth } = useAuthStore();

  const [searchFocused,  setSearchFocused]  = useState(false);
  const [searchValue,    setSearchValue]    = useState('');
  const [notifOpen,      setNotifOpen]      = useState(false);
  const [profileOpen,    setProfileOpen]    = useState(false);
  const [notifications,  setNotifications]  = useState(NOTIFICATIONS);

  const searchRef  = useRef<HTMLInputElement>(null);
  const unreadCount = notifications.filter((n) => n.unread).length;

  // Cmd/Ctrl+K → focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Resolve page title from pathname
  const pageTitle = PAGE_TITLES[pathname]
    ?? pathname.split('/').filter(Boolean).at(-1)?.replace(/-/g, ' ')
    ?? 'Dashboard';

  // Breadcrumb segments
  const crumbs = pathname.split('/').filter(Boolean);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  const initials = user?.name
    ?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'VA';

  const closeAll = () => { setNotifOpen(false); setProfileOpen(false); };

  return (
    <>
      {/* ── Click-away backdrop ─────────────────────────────────── */}
      {(notifOpen || profileOpen) && (
        <div className="fixed inset-0 z-40" onClick={closeAll} />
      )}

      <header
        id="desktop-topbar"
        className="flex-shrink-0 h-16 flex items-center gap-4 px-6 relative z-50"
        style={{
          background:           'rgba(8,8,14,0.80)',
          backdropFilter:       'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          borderBottom:         '1px solid rgba(255,255,255,0.055)',
        }}
      >
        {/* ── LEFT: Page title + breadcrumb ────────────────────── */}
        <div className="flex-shrink-0 min-w-0">
          {/* Page title */}
          <h1 className="text-[15px] font-semibold text-white leading-none capitalize">
            {pageTitle}
          </h1>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 mt-0.5">
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={10} className="text-gray-700" />}
                <span className={cn(
                  'text-[10px] font-medium capitalize',
                  i === crumbs.length - 1 ? 'text-gray-500' : 'text-gray-700'
                )}>
                  {crumb.replace(/-/g, ' ')}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* ── CENTER: Search ────────────────────────────────────── */}
        <div className="flex-1 max-w-md mx-auto">
          <motion.div
            animate={searchFocused
              ? { borderColor: 'rgba(0,255,136,0.45)',
                  boxShadow:   '0 0 0 3px rgba(0,255,136,0.08), 0 0 20px rgba(0,255,136,0.05)' }
              : { borderColor: 'rgba(255,255,255,0.07)',
                  boxShadow:   'none' }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-2.5 rounded-xl border px-3.5 py-2"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <Search size={14} className={cn(
              'flex-shrink-0 transition-colors duration-150',
              searchFocused ? 'text-vault-green' : 'text-gray-600'
            )} />

            <input
              ref={searchRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search vaults, assets, members…"
              className="flex-1 bg-transparent text-[13px] text-white placeholder-gray-600 outline-none min-w-0"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />

            {/* Clear button */}
            <AnimatePresence>
              {searchValue && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  onClick={() => { setSearchValue(''); searchRef.current?.focus(); }}
                  className="text-gray-600 hover:text-white transition-colors"
                >
                  <X size={12} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Keyboard shortcut hint */}
            {!searchFocused && !searchValue && (
              <div className="hidden lg:flex items-center gap-0.5 flex-shrink-0">
                <kbd className="flex items-center justify-center h-5 w-5 rounded
                                bg-white/[0.05] border border-white/[0.07]
                                text-[10px] text-gray-600 font-mono">
                  <Command size={9} />
                </kbd>
                <kbd className="flex items-center justify-center h-5 px-1.5 rounded
                                bg-white/[0.05] border border-white/[0.07]
                                text-[10px] text-gray-600 font-mono">
                  K
                </kbd>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── RIGHT: AI button + Notifications + Profile ──────── */}
        <div className="flex items-center gap-1.5 flex-shrink-0">

          {/* AI quick-access button with icon.png */}
          <Link
            href="/dashboard/ai"
            id="topbar-ai-btn"
            className={cn(
              'hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl',
              'text-[12px] font-semibold transition-all duration-200',
              pathname === '/dashboard/ai'
                ? 'bg-white/10 border border-white/20 text-white shadow-sm'
                : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
            )}
          >
            <Image
              src="/icon.png"
              alt="VaultAI"
              width={16}
              height={16}
              className="object-contain"
            />
            Ask AI
          </Link>

          {/* ── Notifications ──────────────────────────────────── */}
          <div className="relative">
            <motion.button
              id="topbar-notifications-btn"
              whileTap={{ scale: 0.9 }}
              onClick={() => { setNotifOpen((o) => !o); setProfileOpen(false); }}
              aria-label="Notifications"
              aria-expanded={notifOpen}
              className={cn(
                'relative h-9 w-9 rounded-xl flex items-center justify-center',
                'border transition-all duration-150',
                notifOpen
                  ? 'bg-white/[0.08] border-white/[0.12] text-white'
                  : 'bg-white/[0.04] border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.07] hover:border-white/[0.10]'
              )}
            >
              <Bell size={16} />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full
                               bg-vault-green flex items-center justify-center
                               text-[8px] font-bold text-vault-darker leading-none
                               shadow-[0_0_8px_rgba(0,255,136,0.6)]"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Notification panel */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  key="notif-panel"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 top-11 z-50 w-[340px] rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(10,10,16,0.96)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,255,136,0.04)',
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13px] font-semibold text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-[9px] font-bold text-vault-green bg-vault-green/10
                                         border border-vault-green/20 rounded-full px-1.5 py-0.5">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="flex items-center gap-1 text-[11px] text-vault-green
                                   hover:text-emerald-300 transition-colors"
                      >
                        <CheckCheck size={12} />
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="divide-y divide-white/[0.04] max-h-[320px] overflow-y-auto">
                    {notifications.map((n) => (
                      <motion.div
                        key={n.id}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors',
                          n.unread && 'bg-white/[0.015]'
                        )}
                      >
                        {/* Dot */}
                        <div className="flex-shrink-0 mt-1.5">
                          <span
                            className="block h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: n.dot,
                              boxShadow: n.unread ? `0 0 6px ${n.dot}80` : 'none',
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-[12px] leading-snug',
                            n.unread ? 'font-semibold text-white' : 'font-medium text-gray-400'
                          )}>
                            {n.title}
                          </p>
                          <p className="text-[11px] text-gray-600 truncate mt-0.5">{n.sub}</p>
                        </div>
                        <span className="text-[10px] text-gray-700 flex-shrink-0 mt-0.5">{n.time}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-white/[0.06] text-center">
                    <button className="text-[11px] text-vault-green hover:text-emerald-300 transition-colors font-medium">
                      View all notifications →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Profile avatar ─────────────────────────────────── */}
          <div className="relative">
            <motion.button
              id="topbar-profile-btn"
              whileTap={{ scale: 0.94 }}
              onClick={() => { setProfileOpen((o) => !o); setNotifOpen(false); }}
              aria-label="Profile menu"
              aria-expanded={profileOpen}
              className={cn(
                'flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl',
                'border transition-all duration-150',
                profileOpen
                  ? 'bg-white/[0.08] border-white/[0.12]'
                  : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.10]'
              )}
            >
              {/* Avatar — use avatarUrl if available, else initials */}
              <div className="relative h-7 w-7 rounded-lg overflow-hidden flex-shrink-0
                              border border-vault-green/25
                              bg-gradient-to-br from-vault-green/25 to-emerald-700/20
                              flex items-center justify-center
                              text-vault-green text-[10px] font-bold
                              shadow-[0_0_10px_rgba(0,255,136,0.15)]">
                {user?.avatarUrl
                  ? <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
                  : <span>{initials}</span>
                }
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full
                                 bg-vault-green border-2 border-vault-darker
                                 shadow-[0_0_4px_rgba(0,255,136,0.8)]" />
              </div>

              {/* Name + role (xl+ only) */}
              <div className="hidden xl:block text-left">
                <p className="text-[12px] font-semibold text-white leading-none">
                  {user?.name ?? 'Vault Admin'}
                </p>
                <p className="text-[10px] text-gray-600 leading-none mt-0.5 capitalize">
                  {user?.role ?? 'Enterprise'}
                </p>
              </div>

              <ChevronDown
                size={12}
                className={cn(
                  'text-gray-600 hidden xl:block transition-transform duration-200',
                  profileOpen && 'rotate-180'
                )}
              />
            </motion.button>

            {/* Profile dropdown */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  key="profile-panel"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 top-11 z-50 w-56 rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(10,10,16,0.96)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
                  }}
                >
                  {/* User info header */}
                  <div className="px-4 py-3.5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl overflow-hidden flex-shrink-0
                                      bg-gradient-to-br from-vault-green/25 to-emerald-700/20
                                      border border-vault-green/25
                                      flex items-center justify-center
                                      text-vault-green text-[11px] font-bold">
                        {user?.avatarUrl
                          ? <Image src={user.avatarUrl} alt={user.name ?? ''} width={36} height={36} className="object-cover" />
                          : initials
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-white truncate leading-none">
                          {user?.name ?? 'Vault Admin'}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">
                          {user?.email ?? ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  {[
                    { label: 'My Profile',  icon: User,     href: '/dashboard/profile'   },
                    { label: 'Settings',    icon: Settings,  href: '/dashboard/settings'  },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={closeAll}
                      className="flex items-center gap-3 px-4 py-2.5
                                 text-[13px] text-gray-400 hover:text-white
                                 hover:bg-white/[0.04] transition-colors"
                    >
                      <item.icon size={14} className="flex-shrink-0" />
                      {item.label}
                    </Link>
                  ))}

                  {/* Logout */}
                  <div className="border-t border-white/[0.06] mt-0.5">
                    <button
                      id="topbar-logout-btn"
                      onClick={() => { closeAll(); clearAuth(); router.push('/auth/login'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5
                                 text-[13px] text-red-400
                                 hover:bg-red-500/[0.07] hover:text-red-300
                                 transition-colors"
                    >
                      <LogOut size={14} className="flex-shrink-0" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
    </>
  );
}

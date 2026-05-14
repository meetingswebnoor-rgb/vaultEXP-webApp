'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { MAIN_NAV, RESOURCE_NAV, type NavItem } from '@/config/navigation';

import useAuth from '@/src/store/useAuth';
import { cn } from '@/lib/utils/cn';

// ── Width tokens ───────────────────────────────────────────────────────────────
const EXPANDED_W  = 248;  // px
const COLLAPSED_W =  68;  // px

// ── Props ──────────────────────────────────────────────────────────────────────
interface DesktopSidebarProps {
  collapsed: boolean;
  onToggle:  () => void;
}

/**
 * DesktopSidebar — Premium glassmorphism vertical navigation.
 *
 * Structure:
 *   ┌─────────────────┐
 *   │  Logo + toggle  │  fixed header (64px)
 *   ├─────────────────┤
 *   │  Plan badge     │  enterprise tier indicator
 *   ├─────────────────┤
 *   │  MAIN          ↕│  scrollable nav (flex-1)
 *   │  ─────────────  │
 *   │  TOOLS         ↕│
 *   ├─────────────────┤
 *   │  User + logout  │  fixed footer
 *   └─────────────────┘
 *
 * Features:
 *  • Spring-animated width (expand ↔ collapse)
 *  • Glass panel — dark gradient + 28px backdrop blur
 *  • Hover glow: icon background lights up on hover
 *  • Active item: shared layoutId bg + left accent bar
 *  • AI item: special emerald glow + animated sparkle border
 *  • Collapsed: icon-only with native tooltip (title attr)
 *  • Expand trigger: click the right edge or the chevron
 *  • Keyboard accessible — all items are <a> elements
 */
export function DesktopSidebar({ collapsed, onToggle }: DesktopSidebarProps) {
  const pathname            = usePathname();
  const { user, logout } = useAuth();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'V';

  return (
    <motion.aside
      animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
      transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
      className="flex-shrink-0 h-full flex flex-col relative z-20 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, rgba(12,20,16,0.98) 0%, rgba(8,8,14,0.98) 100%)',
        backdropFilter:       'blur(28px) saturate(160%)',
        WebkitBackdropFilter: 'blur(28px) saturate(160%)',
        borderRight: '1px solid rgba(255,255,255,0.055)',
      }}
    >

      {/* ── Right edge glow line ──────────────────────────────── */}
      <div
        className="absolute top-0 right-0 w-px h-full pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(0,255,136,0.18) 40%, rgba(0,255,136,0.08) 80%, transparent 100%)',
        }}
      />

      {/* ── Ambient glow blob ─────────────────────────────────── */}
      <div
        className="absolute top-24 -left-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'rgba(0,255,136,0.04)', filter: 'blur(40px)' }}
      />

      {/* ════════════════════════════════════════════════════════
          HEADER — Logo + collapse toggle
      ════════════════════════════════════════════════════════ */}
      <div
        className={cn(
          'flex items-center h-16 px-4 flex-shrink-0',
          'border-b border-white/[0.05]',
          collapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {/* Logo — icon only when collapsed, full logo when expanded */}
        <Link
          href="/dashboard"
          className="flex items-center min-w-0"
          aria-label="Go to Dashboard"
        >
          {collapsed ? (
            <motion.div
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center justify-center"
            >
              <Image
                src="/icon.png"
                alt="VaultEXP"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="logo"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
              >
                <Image
                  src="/dlogo.png"
                  alt="VaultEXP"
                  width={150}
                  height={40}
                  className="object-contain"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          )}
        </Link>

        {/* Collapse toggle — only visible in expanded state */}
        <AnimatePresence>
          {!collapsed && (
            <motion.button
              id="sidebar-collapse-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              onClick={onToggle}
              aria-label="Collapse sidebar"
              className={cn(
                'flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center',
                'text-gray-600 hover:text-gray-200',
                'bg-white/0 hover:bg-white/[0.06]',
                'border border-transparent hover:border-white/[0.08]',
                'transition-all duration-150'
              )}
            >
              <ChevronLeft size={14} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Expand handle — shown when collapsed, clicking expands */}
        {collapsed && (
          <motion.button
            id="sidebar-expand-btn"
            onClick={onToggle}
            aria-label="Expand sidebar"
            whileTap={{ scale: 0.88 }}
            className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full z-30
                       bg-vault-dark border border-vault-green/25 flex items-center justify-center
                       text-vault-green/70 hover:text-vault-green hover:border-vault-green/50
                       shadow-[0_0_8px_rgba(0,255,136,0.2)] hover:shadow-[0_0_14px_rgba(0,255,136,0.4)]
                       transition-all duration-200"
          >
            <ChevronRight size={11} />
          </motion.button>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          PLAN BADGE
      ════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-3 mt-3 overflow-hidden flex-shrink-0"
          >
            <div
              className="rounded-xl p-2.5 flex items-center gap-2.5"
              style={{
                background: 'linear-gradient(135deg, rgba(0,255,136,0.07) 0%, rgba(0,255,136,0.02) 100%)',
                border: '1px solid rgba(0,255,136,0.10)',
              }}
            >
              <div
                className="h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center"
                style={{ background: 'rgba(0,255,136,0.12)', border: '1px solid rgba(0,255,136,0.2)' }}
              >
                <Shield size={12} className="text-vault-green" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-vault-green leading-none">
                  Enterprise Plan
                </p>
                <p className="text-[9px] text-gray-600 mt-0.5 truncate">
                  All modules active
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════
          NAV — scrollable
      ════════════════════════════════════════════════════════ */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-px"
        style={{ scrollbarWidth: 'none' }}
        aria-label="Main navigation"
      >

        {/* Section: Main */}
        <NavSection label="Main" collapsed={collapsed} />
        {MAIN_NAV.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          return (
            <SidebarItem
              key={item.href}
              item={item}
              active={active}
              collapsed={collapsed}
            />
          );
        })}

        <Divider />

        {/* Section: Tools */}
        <NavSection label="Tools" collapsed={collapsed} />
        {RESOURCE_NAV.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            active={pathname.startsWith(item.href)}
            collapsed={collapsed}
          />
        ))}

      </nav>

      {/* ════════════════════════════════════════════════════════
          FOOTER — Settings + User card + Logout
      ════════════════════════════════════════════════════════ */}
      <div
        className="flex-shrink-0 border-t border-white/[0.05] p-2 space-y-px"
      >
        {/* Settings link */}
        <SidebarItem
          item={{ href: '/dashboard/settings', label: 'Settings', icon: Settings }}
          active={pathname === '/dashboard/settings'}
          collapsed={collapsed}
        />

        {/* Help link */}
        <SidebarItem
          item={{ href: '/help', label: 'Help', icon: HelpCircle }}
          active={pathname === '/help'}
          collapsed={collapsed}
        />

        {/* Divider */}
        <div className="my-1.5 mx-1 border-t border-white/[0.05]" />

        {/* User card + Logout */}
        <div
          role="button"
          tabIndex={0}
          onClick={logout}
          onKeyDown={(e) => e.key === 'Enter' && logout()}
          aria-label="Sign out"
          title={collapsed ? 'Sign out' : undefined}
          className={cn(
            'flex items-center gap-2.5 rounded-xl p-2 cursor-pointer',
            'group hover:bg-red-500/[0.07] transition-all duration-150',
            collapsed && 'justify-center'
          )}
        >
          {/* Avatar */}
          <div
            className={cn(
              'flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center',
              'text-vault-green text-[11px] font-bold',
              'border border-vault-green/25',
              'shadow-[0_0_10px_rgba(0,255,136,0.12)]',
              'group-hover:border-red-400/30 group-hover:shadow-[0_0_10px_rgba(239,68,68,0.12)]',
              'transition-all duration-200'
            )}
            style={{ background: 'rgba(0,255,136,0.10)' }}
          >
            {initials}
          </div>

          {/* Name + email */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-[12px] font-semibold text-white truncate leading-none">
                  {user?.name ?? 'Vault Member'}
                </p>
                <p className="text-[10px] text-gray-600 truncate mt-0.5">
                  {user?.email ?? 'No email set'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logout icon */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LogOut
                  size={13}
                  className="flex-shrink-0 text-gray-700 group-hover:text-red-400 transition-colors duration-150"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}

// ── NavSection label ───────────────────────────────────────────────────────────
function NavSection({ label, collapsed }: { label: string; collapsed: boolean }) {
  return (
    <AnimatePresence>
      {!collapsed && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="px-3 pt-1 pb-2 text-[9px] font-bold uppercase tracking-[0.15em] text-gray-700 select-none"
        >
          {label}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────────
function Divider() {
  return <div className="my-2 mx-1 border-t border-white/[0.05]" />;
}

// ── SidebarItem ────────────────────────────────────────────────────────────────
interface SidebarItemProps {
  item:      NavItem;
  active:    boolean;
  collapsed: boolean;
}

function SidebarItem({ item, active, collapsed }: SidebarItemProps) {
  const Icon    = item.icon;
  const isAI    = item.isAI ?? false;

  return (
    <Link
      href={item.href}
      id={`sidebar-${item.label.toLowerCase().replace(/\s/g, '-')}`}
      title={collapsed ? item.label : undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex items-center gap-3 rounded-xl transition-colors duration-150 outline-none group',
        collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
        active
          ? isAI ? 'text-emerald-300' : 'text-vault-green'
          : 'text-gray-500 hover:text-white'
      )}
    >
      {/* ── Active background pill (shared layoutId → slides) ── */}
      {active && (
        <motion.div
          layoutId="sidebar-active-bg"
          className="absolute inset-0 rounded-xl pointer-events-none"
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          style={
            isAI
              ? {
                  background: 'linear-gradient(135deg, rgba(0,255,136,0.14) 0%, rgba(16,185,129,0.05) 100%)',
                  border: '1px solid rgba(0,255,136,0.18)',
                }
              : {
                  background: 'linear-gradient(135deg, rgba(0,255,136,0.10) 0%, rgba(0,255,136,0.03) 100%)',
                  border: '1px solid rgba(0,255,136,0.12)',
                }
          }
        />
      )}

      {/* ── Hover background (inactive only) ─────────────────── */}
      {!active && (
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-white/[0.035]" />
      )}

      {/* ── Active left accent bar ────────────────────────────── */}
      {active && (
        <motion.span
          layoutId="sidebar-active-bar"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          style={{
            background: isAI
              ? 'linear-gradient(180deg, #00FF88, #10b981)'
              : '#00FF88',
            boxShadow: '0 0 10px rgba(0,255,136,0.8), 0 0 20px rgba(0,255,136,0.3)',
          }}
        />
      )}

      {/* ── Icon container ────────────────────────────────────── */}
      <div
        className={cn(
          'relative flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center',
          'transition-all duration-200',
          // Hover glow
          !active && 'group-hover:bg-white/[0.07]',
          // AI special border animation
          isAI && active && 'shadow-[0_0_14px_rgba(0,255,136,0.35)]',
        )}
        style={
          active
            ? isAI
              ? { background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.22)' }
              : { background: 'rgba(0,255,136,0.12)', border: '1px solid rgba(0,255,136,0.18)' }
            : undefined
        }
      >
        {/* Hover glow halo */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={
            active
              ? { background: 'rgba(255,255,255,0.06)' }
              : { background: 'rgba(255,255,255,0.02)' }
          }
        />

        {/* AI icon.png — clean animation */}
        {isAI ? (
          <motion.div
            animate={active ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={active ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
            className="relative z-10 flex items-center justify-center w-full h-full"
          >
            <Image
              src="/icon.png"
              alt="VaultAI"
              width={32}
              height={32}
              className="object-cover w-full h-full rounded-xl"
            />
          </motion.div>
        ) : (
          <Icon
            size={16}
            strokeWidth={active ? 2.2 : 1.7}
            className="relative z-10 transition-colors duration-150"
          />
        )}
      </div>

      {/* ── Label ────────────────────────────────────────────── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'relative text-[13px] font-medium whitespace-nowrap overflow-hidden flex-1 leading-none',
              isAI && active && 'font-semibold'
            )}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* ── Badge (count) ─────────────────────────────────────── */}
      {item.badge && !collapsed && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative ml-auto text-[9px] font-bold text-gray-400
                     bg-white/[0.06] border border-white/[0.08] rounded-full
                     px-1.5 py-0.5 min-w-[18px] text-center leading-none"
        >
          {item.badge}
        </motion.span>
      )}

      {/* ── NEW pill ──────────────────────────────────────────── */}
      {item.isNew && !collapsed && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative ml-auto text-[8px] font-bold tracking-wide
                     text-vault-green bg-vault-green/10 border border-vault-green/25
                     rounded-full px-1.5 py-0.5 leading-none"
          style={{ boxShadow: '0 0 6px rgba(0,255,136,0.2)' }}
        >
          NEW
        </motion.span>
      )}

      {/* ── Collapsed badge dot ───────────────────────────────── */}
      {item.badge && collapsed && (
        <span
          className="absolute top-1 right-1 h-2 w-2 rounded-full bg-vault-green
                     shadow-[0_0_5px_rgba(0,255,136,0.7)]"
        />
      )}
    </Link>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { MOBILE_NAV_TABS, type MobileNavTab } from '@/config/navigation';
import { cn } from '@/lib/utils/cn';

// ── Constants ──────────────────────────────────────────────────────────────────

const NAV_HEIGHT = 72; // px — bar height (excluding safe area)

// ── Component ──────────────────────────────────────────────────────────────────

interface MobileBottomNavProps {
  /** Called when the center AI button is tapped */
  onFabPress?: () => void;
}

/**
 * MobileBottomNav — Premium 5-tab glassmorphism bottom navigation.
 *
 * Layout:
 *   [Home] [Portfolio] [· AI ·] [Features] [Profile]
 *                         ↑
 *          Elevated glowing center button — opens VaultAI
 *
 * Features:
 *  • Glassmorphism bar with backdrop blur
 *  • Active state: icon + label turn vault-green + top indicator bar
 *  • Spring-physics tap scale on every tab
 *  • Center AI button: elevated, multi-layer glow, rotating sparkle
 *  • layoutId shared indicator that slides between active tabs
 *  • Safe area aware (iOS home indicator)
 */
export function MobileBottomNav({ onFabPress }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router   = useRouter();

  // Separate the center tab from the outer tabs
  const leftTabs   = MOBILE_NAV_TABS.filter((t) => !t.isCenter).slice(0, 2);
  const rightTabs  = MOBILE_NAV_TABS.filter((t) => !t.isCenter).slice(2, 4);
  const centerTab  = MOBILE_NAV_TABS.find((t) => t.isCenter)!;

  const isAIActive = pathname === centerTab.href;

  const handleAIPress = () => {
    if (onFabPress) {
      onFabPress();
    } else {
      router.push(centerTab.href);
    }
  };

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Primary navigation"
      className="flex-shrink-0 relative z-30"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* ── Glass bar ──────────────────────────────────────────── */}
      <div
        className="relative flex items-center h-[72px]"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,10,15,0.82) 0%, rgba(5,5,10,0.96) 100%)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >

        {/* Top edge glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-vault-green/25 to-transparent pointer-events-none" />

        {/* Inner glow haze (centered) */}
        <div className="absolute inset-0 bg-gradient-to-t from-vault-green/[0.03] to-transparent pointer-events-none" />

        {/* ── Left pair ────────────────────────────────────────── */}
        <div className="flex flex-1 items-center justify-around">
          {leftTabs.map((tab) => (
            <NavTab
              key={tab.href}
              tab={tab}
              active={
                tab.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(tab.href)
              }
            />
          ))}
        </div>

        {/* ── Center AI Button ─────────────────────────────────── */}
        <div className="relative flex items-center justify-center w-20 flex-shrink-0 -mt-6">
          <AIButton active={isAIActive} onPress={handleAIPress} />
        </div>

        {/* ── Right pair ───────────────────────────────────────── */}
        <div className="flex flex-1 items-center justify-around">
          {rightTabs.map((tab) => (
            <NavTab
              key={tab.href}
              tab={tab}
              active={pathname.startsWith(tab.href)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

// ── NavTab ─────────────────────────────────────────────────────────────────────

interface NavTabProps {
  tab:    MobileNavTab;
  active: boolean;
}

function NavTab({ tab, active }: NavTabProps) {
  const Icon = tab.icon;

  return (
    <Link
      href={tab.href}
      id={`nav-tab-${tab.label.toLowerCase()}`}
      aria-label={tab.label}
      aria-current={active ? 'page' : undefined}
      className="relative flex flex-col items-center justify-center gap-[3px] w-14 h-full py-2 group"
    >
      {/* Active indicator bar (slides via layoutId) */}
      <AnimatePresence>
        {active && (
          <motion.span
            key="indicator"
            layoutId="nav-active-indicator"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 380 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-6 rounded-full bg-vault-green"
            style={{ boxShadow: '0 0 8px rgba(0,255,136,0.9), 0 0 20px rgba(0,255,136,0.4)' }}
          />
        )}
      </AnimatePresence>

      {/* Icon wrapper with tap spring */}
      <motion.div
        whileTap={{ scale: 0.72 }}
        transition={{ type: 'spring', damping: 16, stiffness: 500 }}
        className={cn(
          'relative flex items-center justify-center h-7 w-7 rounded-xl transition-colors duration-200',
          active ? 'text-vault-green' : 'text-gray-500 group-hover:text-gray-300'
        )}
      >
        {/* Soft icon glow when active */}
        {active && (
          <span
            className="absolute inset-0 rounded-xl"
            style={{ background: 'rgba(0,255,136,0.10)', filter: 'blur(4px)' }}
          />
        )}
        <Icon
          size={20}
          strokeWidth={active ? 2.2 : 1.6}
          className="relative z-10"
        />

        {/* Badge pill */}
        {tab.badge && (
          <span className="absolute -top-1 -right-1.5 h-4 min-w-[16px] px-1 rounded-full
                           bg-vault-green flex items-center justify-center
                           text-[8px] font-bold text-vault-dark leading-none
                           shadow-[0_0_6px_rgba(0,255,136,0.6)]">
            {tab.badge}
          </span>
        )}
      </motion.div>

      {/* Label */}
      <motion.span
        animate={active
          ? { color: '#00FF88', y: 0 }
          : { color: '#6b7280', y: 0 }}
        transition={{ duration: 0.18 }}
        className="text-[9px] font-semibold leading-none tracking-wide"
      >
        {tab.label}
      </motion.span>
    </Link>
  );
}

// ── AIButton ───────────────────────────────────────────────────────────────────

interface AIButtonProps {
  active:   boolean;
  onPress:  () => void;
}

function AIButton({ active, onPress }: AIButtonProps) {
  return (
    <motion.button
      id="nav-ai-fab"
      aria-label="Open VaultAI"
      onClick={onPress}
      whileTap={{ scale: 0.84 }}
      whileHover={{ scale: 1.07 }}
      transition={{ type: 'spring', damping: 18, stiffness: 480 }}
      className="relative flex items-center justify-center"
    >
      {/* Clean button disc */}
      <motion.span
        animate={active
          ? { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }
          : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        transition={{ duration: 0.3 }}
        className="relative h-[50px] w-[50px] rounded-full flex items-center justify-center transition-colors"
      >
        {/* icon.png — clean animation */}
        <motion.span
          animate={active ? { scale: 1.15 } : { scale: 1 }}
          transition={{ type: 'spring', damping: 10, stiffness: 120 }}
          className="relative z-10 flex items-center justify-center"
        >
          <Image
            src="/icon.png"
            alt="VaultAI"
            width={28}
            height={28}
            className="object-contain"
          />
        </motion.span>
      </motion.span>

      {/* Label beneath button */}
      <motion.span
        animate={active ? { color: '#00FF88' } : { color: '#9ca3af' }}
        className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold tracking-wider whitespace-nowrap"
      >
        VAULT AI
      </motion.span>
    </motion.button>
  );
}

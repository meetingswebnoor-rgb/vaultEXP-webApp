'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { VaultAIOrb } from '@/components/branding/VaultAIOrb';
import { NavItem } from '@/config/navigation';

interface SidebarNavProps {
  items: NavItem[];
  collapsed: boolean;
  sectionLabel?: string;
}

export function SidebarNav({ items, collapsed, sectionLabel }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-1 px-3">
      {sectionLabel && !collapsed && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 pt-4 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 select-none"
        >
          {sectionLabel}
        </motion.p>
      )}

      <div className={cn("space-y-1", collapsed && "pt-4")}>
        {items.map((item) => {
          const active = item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname.startsWith(item.href);
          
          return (
            <NavItemComponent 
              key={item.href} 
              item={item} 
              active={active} 
              collapsed={collapsed} 
            />
          );
        })}
      </div>
    </div>
  );
}

function NavItemComponent({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  const Icon = item.icon;
  const isAI = item.isAI ?? false;

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl transition-all duration-300 outline-none",
        collapsed ? "justify-center p-0 h-11 w-11 mx-auto" : "px-4 py-3",
        active ? "text-vault-green" : "text-gray-500 hover:text-white"
      )}
    >
      {/* Active State Background (Glass Morphism) */}
      {active && (
        <motion.div
          layoutId="sidebar-active-glow"
          className="absolute inset-0 rounded-xl bg-vault-green/10 border border-vault-green/20 pointer-events-none"
          initial={false}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
        >
          <div className="absolute inset-0 bg-vault-green/5 blur-md" />
        </motion.div>
      )}

      {/* Hover Highlight */}
      {!active && (
        <div className={cn(
          "absolute inset-0 rounded-xl bg-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity",
          collapsed && "bg-vault-green/5 border border-vault-green/10"
        )} />
      )}

      {/* Active Left Indicator */}
      {active && (
        <motion.div
          layoutId="sidebar-active-bar"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-vault-green rounded-r-full shadow-[0_0_12px_rgba(0,255,136,0.6)]"
        />
      )}

      {/* Icon */}
      <div className={cn(
        "relative z-10 flex items-center justify-center transition-all duration-300",
        collapsed ? "scale-100 group-hover:scale-110" : "group-hover:scale-110",
        active ? "text-vault-green scale-110" : "group-hover:text-white"
      )}>
        {isAI ? (
          <div className="relative">
            <VaultAIOrb size={22} glow={active || collapsed} animated={active} compact={true} />
          </div>
        ) : (
          <div className="relative">
            <Icon size={19} strokeWidth={active ? 2.5 : 2} />
            {collapsed && !active && <div className="absolute inset-0 bg-vault-green/20 blur-md rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />}
          </div>
        )}
      </div>

      {/* Label */}
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className={cn(
              "text-[13px] font-semibold tracking-wide transition-all duration-300 group-hover:translate-x-1",
              active ? "text-white" : "text-gray-500"
            )}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Badges */}
      {!collapsed && (
        <div className="ml-auto flex items-center gap-2">
          {item.badge && (
            <span className="text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
          {item.isNew && (
            <span className="text-[8px] font-black tracking-widest text-vault-green bg-vault-green/10 border border-vault-green/30 px-1.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(0,255,136,0.2)]">
              NEW
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

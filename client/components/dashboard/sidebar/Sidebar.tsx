'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { LogOut, Settings, HelpCircle, Shield, ShieldCheck, LayoutDashboard, Users, CreditCard, LifeBuoy, DollarSign, Mail, Database, ActivitySquare, Palette } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { MAIN_NAV, RESOURCE_NAV } from '@/config/navigation';

import { SidebarLogo } from './SidebarLogo';
import { SidebarNav } from './SidebarNav';
import { SidebarToggle } from './SidebarToggle';
import WorkspaceSwitcher from '../../workspace/WorkspaceSwitcher';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const EXPANDED_W = 260;
const COLLAPSED_W = 80;

/**
 * Sidebar — Premium Modern SaaS Sidebar
 * Glass morphism redesign with fintech polish.
 */
export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'V';

  return (
    <motion.aside
      animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
      transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 1 }}
      className={cn(
        "flex-shrink-0 h-full flex flex-col relative z-[60] transition-colors duration-500",
        "backdrop-blur-[18px] border-r border-white/[0.04]",
        "rounded-r-[24px] shadow-[10px_0_40px_rgba(0,0,0,0.4)]"
      )}
      style={{ backgroundColor: 'var(--ws-sidebar)' }}
    >
      {/* ── Ambient Background Layer ────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden rounded-r-[24px] pointer-events-none">
        {/* Subtle Floating Gradients */}
        <div 
          className="absolute top-[-10%] right-[-20%] w-64 h-64 blur-[100px] rounded-full animate-pulse" 
          style={{ backgroundColor: 'var(--ws-primary)', opacity: 0.05 }} 
        />
        <div className="absolute bottom-[10%] left-[-20%] w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full" />
        
        {/* Neon Edge Highlight */}
        <div 
          className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent to-transparent" 
          style={{ backgroundImage: 'linear-gradient(to bottom, transparent, var(--ws-primary), transparent)', opacity: 0.1 }}
        />
      </div>

      {/* ── Header: Logo ────────────────────────────────────── */}
      <SidebarLogo collapsed={collapsed} />

      {/* ── Workspace Switcher ──────────────────────────────── */}
      <div className="px-4 mb-2">
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      {/* ── Toggle Button ──────────────────────────────────── */}
      <SidebarToggle collapsed={collapsed} onToggle={onToggle} />

      {/* ── Plan Badge ─────────────────────────────────────── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="px-5 mb-2"
          >
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] transition-colors hover:border-white/10">
              <div 
                className="h-7 w-7 rounded-lg flex items-center justify-center border border-white/10"
                style={{ backgroundColor: 'var(--ws-primary)', opacity: 0.8 }}
              >
                <Shield size={12} className="text-[#0A0F14]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-white leading-none">Enterprise</p>
                <p className="text-[9px] text-gray-500 mt-0.5 truncate">All modules active</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation: Scrollable ──────────────────────────── */}
      <nav 
        className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 pb-4 custom-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        <SidebarNav items={MAIN_NAV} collapsed={collapsed} sectionLabel="Main" />
        <SidebarNav items={RESOURCE_NAV} collapsed={collapsed} sectionLabel="Tools" />
      </nav>

      {/* ── Footer: Actions & Profile ───────────────────────── */}
      <div className="mt-auto border-t border-white/[0.04] p-3 space-y-1.5">
        <SidebarActionItem 
          icon={Settings} 
          label="Settings" 
          href="/dashboard/settings" 
          active={pathname === '/dashboard/settings'}
          collapsed={collapsed} 
        />
        <SidebarActionItem 
          icon={Palette} 
          label="Branding" 
          href="/dashboard/settings/branding" 
          active={pathname === '/dashboard/settings/branding'}
          collapsed={collapsed} 
        />
        <SidebarActionItem 
          icon={HelpCircle} 
          label="Help Center" 
          href="/help" 
          active={pathname === '/help'}
          collapsed={collapsed} 
        />

        <div className="pt-1">
          <div 
            onClick={logout}
            className={cn(
              "flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all duration-300",
              "bg-red-500/5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 group",
              collapsed ? "justify-center" : "px-3"
            )}
          >
            <div 
              className={cn(
                "h-8 w-8 rounded-xl flex items-center justify-center border flex-shrink-0 transition-all",
                "shadow-sm"
              )}
              style={{ backgroundColor: 'var(--ws-primary)', borderColor: 'var(--ws-primary)' }}
            >
              <span className="text-[11px] font-bold text-[#0A0F14]">{initials}</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name ?? 'Vault Member'}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-gray-500 truncate">Sign out</p>
                  <LogOut size={10} className="text-gray-600 group-hover:text-red-400" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

function SidebarActionItem({ icon: Icon, label, href, active, collapsed }: { icon: any; label: string; href: string; active: boolean; collapsed: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl transition-all duration-300",
        collapsed ? "justify-center h-10 w-10 mx-auto" : "px-4 py-2.5",
        active ? "text-vault-green bg-vault-green/10 border border-vault-green/20" : "text-gray-500 hover:text-white hover:bg-white/[0.03]"
      )}
    >
      <Icon size={16} />
      {!collapsed && <span className="text-[12px] font-medium">{label}</span>}
    </Link>
  );
}

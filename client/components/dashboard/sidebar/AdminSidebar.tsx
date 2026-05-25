'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  LogOut, LayoutDashboard, Users, UserCircle, FolderKanban, 
  CreditCard, Repeat, DollarSign, ShieldAlert, Sparkles, 
  Database, Bell, ActivitySquare, Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore((s) => ({ user: s.user, logout: s.logout }));
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role || '');

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={cn(
          "fixed top-0 left-0 h-full w-[280px] bg-[#050A0F] border-r border-vault-green/20 z-50 flex flex-col",
          "lg:translate-x-0 transition-transform duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,255,136,0.05)]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-20 flex items-center px-6 border-b border-vault-green/20 bg-[url('/grid.svg')]">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-vault-green/10 rounded-xl flex items-center justify-center border border-vault-green/20 group-hover:border-vault-green/50 transition-colors shadow-[0_0_15px_rgba(0,255,136,0.1)] group-hover:shadow-[0_0_20px_rgba(0,255,136,0.2)]">
              <ShieldAlert className="w-6 h-6 text-vault-green" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">VaultEXP</span>
              <span className="block text-[10px] font-bold text-vault-green uppercase tracking-widest mt-0.5">Enterprise Admin</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <div className="space-y-1">
            <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Overview</div>
            <NavItem href="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" isActive={pathname === '/admin/dashboard'} />
            <NavItem href="/admin/analytics" icon={ActivitySquare} label="Platform Analytics" isActive={pathname.startsWith('/admin/analytics')} />

            <div className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Management</div>
            {isSuperAdmin && (
              <NavItem href="/admin/access" icon={ShieldAlert} label="Access Control" isActive={pathname.startsWith('/admin/access')} />
            )}
            <NavItem href="/admin/users" icon={Users} label="User Management" isActive={pathname.startsWith('/admin/users')} />
            <NavItem href="/admin/clients" icon={UserCircle} label="Client Management" isActive={pathname.startsWith('/admin/clients')} />
            <NavItem href="/admin/workspaces" icon={FolderKanban} label="Workspace Management" isActive={pathname.startsWith('/admin/workspaces')} />

            {isAdmin && (
              <>
                <div className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Financials</div>
                <NavItem href="/admin/billing" icon={CreditCard} label="Billing" isActive={pathname.startsWith('/admin/billing')} />
                <NavItem href="/admin/subscriptions" icon={Repeat} label="Subscriptions" isActive={pathname.startsWith('/admin/subscriptions')} />
                <NavItem href="/admin/revenue" icon={DollarSign} label="Revenue" isActive={pathname.startsWith('/admin/revenue')} />
              </>
            )}

            {isSuperAdmin && (
              <>
                <div className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">System</div>
                <NavItem href="/admin/security" icon={ShieldAlert} label="Security Center" isActive={pathname.startsWith('/admin/security')} />
                <NavItem href="/admin/ai" icon={Sparkles} label="AI Control Center" isActive={pathname.startsWith('/admin/ai')} />
                <NavItem href="/admin/storage" icon={Database} label="Storage Management" isActive={pathname.startsWith('/admin/storage')} />
                <NavItem href="/admin/notifications" icon={Bell} label="Notifications" isActive={pathname.startsWith('/admin/notifications')} />
                <NavItem href="/admin/audit" icon={ActivitySquare} label="Audit Logs" isActive={pathname.startsWith('/admin/audit')} />
                <NavItem href="/admin/settings" icon={Settings} label="Settings" isActive={pathname.startsWith('/admin/settings')} />
              </>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-vault-green/20 bg-[#0A0F14]">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-400 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors border border-transparent hover:border-red-500/20"
          >
            <LogOut size={18} />
            Terminate Session
          </button>
        </div>
      </motion.aside>
    </>
  );
}

function NavItem({ href, icon: Icon, label, isActive }: { href: string, icon: any, label: string, isActive: boolean }) {
  return (
    <Link href={href}>
      <span className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
        isActive 
          ? "bg-vault-green/10 text-vault-green border border-vault-green/20 shadow-[0_0_10px_rgba(0,255,136,0.05)]" 
          : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
      )}>
        <Icon size={18} className={isActive ? "text-vault-green" : "text-gray-500"} />
        {label}
      </span>
    </Link>
  );
}

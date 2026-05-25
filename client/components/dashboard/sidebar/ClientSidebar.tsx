'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, LayoutDashboard, FileText, UploadCloud, CreditCard, Sparkles, CheckSquare, Repeat, BarChart3, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface ClientSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  brandConfig?: any;
}

export function ClientSidebar({ isOpen, onClose, brandConfig }: ClientSidebarProps) {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-vault-obsidian/80 z-40 lg:hidden backdrop-blur-md"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={cn(
          "fixed top-0 left-0 h-full w-[280px] bg-vault-navy/90 border-r border-white/5 z-50 flex flex-col backdrop-blur-2xl shadow-[4px_0_24px_rgba(0,0,0,0.5)]",
          "lg:translate-x-0 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-24 flex items-center px-8 border-b border-white/5 relative overflow-hidden group">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-vault-emerald/0 via-vault-emerald/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
          
          <Link href="/client/dashboard" className="flex items-center gap-4 relative z-10 w-full">
            {brandConfig?.logoUrl ? (
              <Image unoptimized src={brandConfig.logoUrl} alt="Brand Logo" width={120} height={32} className="h-8 w-auto object-contain drop-shadow-md" />
            ) : (
              <>
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-vault-obsidian font-bold shadow-[0_0_15px_rgba(0,230,118,0.3)] text-xl bg-vault-emerald"
                >
                  V
                </div>
                <div>
                  <span className="text-xl font-display font-extrabold text-white tracking-tight drop-shadow-sm">VaultEXP</span>
                  <span className="block text-[10px] font-bold text-vault-emerald uppercase tracking-[0.2em] mt-0.5">Client Portal</span>
                </div>
              </>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
          <div className="space-y-2">
            <NavItem href="/client/dashboard" icon={LayoutDashboard} label="Command Center" isActive={pathname === '/client/dashboard'} />
            <NavItem href="/client/analytics" icon={BarChart3} label="Insights & Data" isActive={pathname.startsWith('/client/analytics')} />
            <NavItem href="/client/messages" icon={MessageSquare} label="Comms & Support" isActive={pathname.startsWith('/client/messages')} />
            <NavItem href="/client/documents" icon={FileText} label="Intelligence Vault" isActive={pathname.startsWith('/client/documents')} />
            <NavItem href="/client/uploads" icon={UploadCloud} label="Secure Drops" isActive={pathname.startsWith('/client/uploads')} />
            <NavItem href="/client/invoices" icon={CreditCard} label="Billing & Finance" isActive={pathname.startsWith('/client/invoices')} />
            <NavItem href="/client/subscriptions" icon={Repeat} label="Active Services" isActive={pathname.startsWith('/client/subscriptions')} />
            <NavItem href="/client/reports" icon={BarChart3} label="Financial Reports" isActive={pathname.startsWith('/client/reports')} />
            <NavItem href="/client/approvals" icon={CheckSquare} label="Pending Approvals" isActive={pathname.startsWith('/client/approvals')} />
            <div className="pt-4 mt-4 border-t border-white/5 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-vault-emerald/30 to-transparent" />
              <NavItem href="/client/ai" icon={Sparkles} label="Vault AI Assistant" isActive={pathname.startsWith('/client/ai')} isHighlight />
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-vault-obsidian/30 backdrop-blur-md">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-bold text-gray-400 rounded-xl hover:bg-white/5 hover:text-white transition-all duration-300 border border-transparent hover:border-white/10 group"
          >
            <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
            End Session
          </button>
        </div>
      </motion.aside>
    </>
  );
}

function NavItem({ href, icon: Icon, label, isActive, isHighlight }: { href: string, icon: any, label: string, isActive: boolean, isHighlight?: boolean }) {
  if (isHighlight) {
    return (
      <Link href={href} className="block group">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
          "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 overflow-hidden",
          isActive 
            ? "text-vault-obsidian bg-vault-emerald shadow-[0_0_20px_rgba(0,230,118,0.3)] border border-[#00FFAA]" 
            : "text-vault-emerald bg-vault-emerald/10 hover:bg-vault-emerald/20 border border-vault-emerald/20"
        )}>
          {!isActive && (
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-vault-emerald/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
          )}
          <Icon size={20} className={cn("relative z-10", isActive ? "text-vault-obsidian" : "text-vault-emerald")} />
          <span className="relative z-10">{label}</span>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link href={href} className="block group">
      <motion.div 
        whileHover={{ x: 4 }}
        className={cn(
        "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
        isActive 
          ? "bg-white/10 text-white border border-white/10 shadow-lg" 
          : "text-gray-400 hover:bg-white/5 hover:text-gray-100 border border-transparent"
      )}>
        {isActive && (
          <motion.div 
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-vault-emerald rounded-r-full shadow-[0_0_10px_rgba(0,230,118,0.5)]"
          />
        )}
        <Icon size={20} className={cn("transition-colors", isActive ? "text-vault-emerald" : "text-gray-500 group-hover:text-gray-300")} />
        {label}
      </motion.div>
    </Link>
  );
}

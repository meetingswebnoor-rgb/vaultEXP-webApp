'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
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
            className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={cn(
          "fixed top-0 left-0 h-full w-[260px] bg-white border-r border-gray-100 z-50 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]",
          "lg:translate-x-0 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <Link href="/client/dashboard" className="flex items-center gap-3">
            {brandConfig?.logoUrl ? (
              <img src={brandConfig.logoUrl} alt="Brand Logo" className="h-8 object-contain" />
            ) : (
              <>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  V
                </div>
                <div>
                  <span className="text-lg font-bold text-gray-900 tracking-tight">VaultEXP</span>
                  <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Client Portal</span>
                </div>
              </>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-1.5">
            <NavItem href="/client/dashboard" icon={LayoutDashboard} label="Home" isActive={pathname === '/client/dashboard'} />
            <NavItem href="/client/analytics" icon={BarChart3} label="Analytics & Insights" isActive={pathname.startsWith('/client/analytics')} />
            <NavItem href="/client/messages" icon={MessageSquare} label="Messages & Support" isActive={pathname.startsWith('/client/messages')} />
            <NavItem href="/client/documents" icon={FileText} label="Shared Documents" isActive={pathname.startsWith('/client/documents')} />
            <NavItem href="/client/uploads" icon={UploadCloud} label="Secure Uploads" isActive={pathname.startsWith('/client/uploads')} />
            <NavItem href="/client/invoices" icon={CreditCard} label="Billing & Invoices" isActive={pathname.startsWith('/client/invoices')} />
            <NavItem href="/client/subscriptions" icon={Repeat} label="Subscriptions" isActive={pathname.startsWith('/client/subscriptions')} />
            <NavItem href="/client/reports" icon={BarChart3} label="Financial Reports" isActive={pathname.startsWith('/client/reports')} />
            <NavItem href="/client/approvals" icon={CheckSquare} label="Approvals" isActive={pathname.startsWith('/client/approvals')} />
            <div className="pt-4 mt-4 border-t border-gray-100">
              <NavItem href="/client/ai" icon={Sparkles} label="Vault AI Assistant" isActive={pathname.startsWith('/client/ai')} isHighlight />
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </motion.aside>
    </>
  );
}

function NavItem({ href, icon: Icon, label, isActive, isHighlight }: { href: string, icon: any, label: string, isActive: boolean, isHighlight?: boolean }) {
  if (isHighlight) {
    return (
      <Link href={href}>
        <span className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm",
          isActive 
            ? "bg-blue-600 text-white border border-blue-700" 
            : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-transparent"
        )}>
          <Icon size={18} className={isActive ? "text-blue-200" : "text-blue-600"} />
          {label}
        </span>
      </Link>
    );
  }

  return (
    <Link href={href}>
      <span className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
        isActive 
          ? "bg-gray-100 text-gray-900" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
      )}>
        <Icon size={18} className={isActive ? "text-gray-900" : "text-gray-400"} />
        {label}
      </span>
    </Link>
  );
}

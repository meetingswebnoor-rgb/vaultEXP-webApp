'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FolderOpen, MessageSquare, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const TABS = [
  { label: 'Dashboard', href: '/portal', icon: Home },
  { label: 'Documents', href: '/portal/documents', icon: FolderOpen },
  { label: 'Messages', href: '/portal/messages', icon: MessageSquare },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-screen bg-vault-darker text-white">
      {/* Client Sidebar */}
      <div className="w-64 bg-vault-card border-r border-white/5 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-vault-green">Client Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome, {user?.name}</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  isActive ? 'bg-vault-green/10 text-vault-green border border-vault-green/20 shadow-[0_0_15px_rgba(0,255,136,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => {
              logout();
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl font-bold transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-vault-darker relative z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-vault-green/5 blur-[120px] pointer-events-none z-0" />
        <div className="relative z-10 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}

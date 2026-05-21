'use client';

import { useState, ReactNode } from 'react';
import { AdminSidebar } from '../dashboard/sidebar/AdminSidebar';
import { Menu, Search, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#0A0F14] text-white">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-[280px] flex flex-col min-h-screen transition-all duration-300">
        {/* Topbar */}
        <header className="h-20 border-b border-red-500/10 bg-[#0A0F14]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-xl text-gray-400 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm w-96 focus-within:border-red-500/50 transition-colors">
              <Search size={16} className="text-gray-500" />
              <input 
                type="text" 
                placeholder="Search global operations..." 
                className="bg-transparent border-none outline-none text-white placeholder-gray-500 w-full font-mono"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 relative text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-white">{user?.name}</div>
                <div className="text-[10px] text-red-500 font-mono uppercase tracking-widest">{user?.role}</div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-bold">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden relative">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

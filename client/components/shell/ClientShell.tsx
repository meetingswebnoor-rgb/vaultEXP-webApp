'use client';

import { useState, ReactNode, useEffect } from 'react';
import { ClientSidebar } from '../dashboard/sidebar/ClientSidebar';
import { Menu, Search, Bell, Command, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

export function ClientShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  const [brandConfig, setBrandConfig] = useState<any>(null);

  useEffect(() => {
    setBrandConfig({
      primaryColor: '#00E676', 
      logoUrl: null
    });
  }, []);

  return (
    <div className="min-h-screen bg-vault-obsidian text-gray-200 font-sans selection:bg-vault-emerald/30 overflow-hidden relative">
      <AnimatedBackground />

      <ClientSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} brandConfig={brandConfig} />
      
      <div className="lg:pl-[280px] flex flex-col min-h-screen transition-all duration-500 relative z-10">
        {/* Floating Topbar */}
        <div className="p-4 md:p-6 lg:p-8 pb-0">
          <header className="h-20 rounded-2xl border border-white/10 bg-vault-navy/60 backdrop-blur-2xl z-30 flex items-center justify-between px-6 shadow-xl">
            <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 transition-colors border border-white/5"
              >
                <Menu size={20} />
              </button>
              
              <div className="hidden md:flex flex-1 max-w-xl items-center gap-3 bg-vault-obsidian/80 border border-white/10 px-4 py-2.5 rounded-xl text-sm focus-within:border-vault-emerald/50 focus-within:ring-1 focus-within:ring-vault-emerald/30 transition-all duration-300 group">
                <Search size={18} className="text-gray-500 group-focus-within:text-vault-emerald transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search intelligence, documents, or transactions..." 
                  className="bg-transparent border-none outline-none text-white placeholder-gray-600 w-full"
                />
                <div className="hidden lg:flex items-center gap-1 text-xs text-gray-500 font-mono px-2 py-1 bg-white/5 rounded-md border border-white/5">
                  <Command size={12} /> K
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <button className="relative p-2 text-gray-400 hover:text-vault-emerald transition-colors rounded-xl hover:bg-vault-emerald/10">
                <Bell size={22} />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
              </button>
              
              <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-white">{user?.name || 'Authorized Client'}</div>
                  <div className="text-[10px] text-vault-emerald font-bold uppercase tracking-[0.15em] flex items-center justify-end gap-1">
                    <Sparkles size={10} /> Active
                  </div>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-vault-obsidian font-extrabold text-lg shadow-[0_0_15px_rgba(0,230,118,0.3)] bg-vault-emerald cursor-pointer"
                >
                  {user?.name?.[0]?.toUpperCase() || 'C'}
                </motion.div>
              </div>
            </div>
          </header>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-4 md:p-6 lg:p-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

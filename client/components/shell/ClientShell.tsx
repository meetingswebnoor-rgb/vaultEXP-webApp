'use client';

import { useState, ReactNode, useEffect } from 'react';
import { ClientSidebar } from '../dashboard/sidebar/ClientSidebar';
import { Menu, Search, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

export function ClientShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  const [brandConfig, setBrandConfig] = useState<any>(null);

  useEffect(() => {
    // In a real system, we'd fetch the WhiteLabelConfig based on user.businessId or the custom domain
    // For now, we simulate fetching the dynamic branding payload
    setBrandConfig({
      primaryColor: '#2563EB', // Default blue, would be fetched from DB
      logoUrl: null
    });
  }, []);

  // Construct dynamic CSS variables to inject at the root level of the shell
  const styleObj = {
    '--brand-primary': brandConfig?.primaryColor || '#2563EB',
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans" style={styleObj}>
      <ClientSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} brandConfig={brandConfig} />
      
      <div className="lg:pl-[260px] flex flex-col min-h-screen transition-all duration-300">
        {/* Topbar */}
        <header className="h-20 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm w-80 focus-within:border-blue-500/50 transition-colors">
              <Search size={16} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search documents and invoices..." 
                className="bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 w-full"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 relative text-gray-400 hover:text-gray-600 transition-colors rounded-xl hover:bg-gray-100">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-blue-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-gray-900">{user?.name}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Client Account</div>
              </div>
              <div 
                className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                {user?.name?.[0]?.toUpperCase() || 'C'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden relative">
          <div className="relative z-10 p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

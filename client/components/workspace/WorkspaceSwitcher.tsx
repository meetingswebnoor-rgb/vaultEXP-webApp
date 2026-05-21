'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Check, ChevronsUpDown, FolderGit2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorkspaceSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const saved = localStorage.getItem('vault-workspace-id');
    if (saved) setActiveId(saved);
  }, []);

  const { data: workspacesData, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await api.get('/workspaces');
      return res.data;
    },
    enabled: isAuthenticated, // Only fetch when authenticated
    retry: 1,
  });

  const workspaces = workspacesData?.data?.workspaces || [];
  
  const activeWorkspace = workspaces.find((w: any) => w.id === activeId) || workspaces[0];

  const switchWorkspace = (id: string) => {
    setActiveId(id);
    localStorage.setItem('vault-workspace-id', id);
    setIsOpen(false);
    // Force a reload to cleanly reset all queries with the new workspace ID
    window.location.reload();
  };

  if (isLoading) return <div className="h-10 w-full animate-pulse bg-white/5 rounded-xl"></div>;
  if (!activeWorkspace) return null;

  return (
    <div className="relative w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2 rounded-xl transition-all border border-transparent hover:bg-white/[0.05] hover:border-white/[0.05] ${isOpen ? 'bg-white/[0.05] border-white/[0.05]' : ''}`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-vault-green/20 to-vault-green/10 text-vault-green">
            <FolderGit2 size={16} />
          </div>
          {!collapsed && (
            <div className="flex flex-col items-start truncate">
              <span className="text-sm font-semibold text-white truncate w-full">{activeWorkspace.name}</span>
              <span className="text-[10px] text-gray-400 font-medium">Enterprise Tenant</span>
            </div>
          )}
        </div>
        {!collapsed && <ChevronsUpDown size={14} className="text-gray-500" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 p-1 bg-[#1A1A1A] border border-white/[0.05] rounded-xl shadow-2xl z-50 w-full min-w-[200px]"
            >
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Workspaces
              </div>
              
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {workspaces.map((w: any) => (
                  <button
                    key={w.id}
                    onClick={() => switchWorkspace(w.id)}
                    className="w-full flex items-center justify-between px-2 py-2 text-sm rounded-lg hover:bg-white/[0.05] transition-colors group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white">
                        <FolderGit2 size={12} />
                      </div>
                      <span className={`truncate ${activeId === w.id ? 'text-white font-medium' : 'text-gray-400'}`}>
                        {w.name}
                      </span>
                    </div>
                    {activeId === w.id && <Check size={14} className="text-vault-green flex-shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="h-[1px] bg-white/[0.05] my-1" />
              
              <button className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-lg hover:bg-white/[0.05] text-gray-400 hover:text-white transition-colors">
                <Plus size={14} />
                <span>Create Workspace</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

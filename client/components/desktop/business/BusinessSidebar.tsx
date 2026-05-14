'use client';

import { Briefcase, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Business {
  id: string;
  name: string;
  type: string;
  color: string;
}

interface BusinessSidebarProps {
  businesses: Business[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export function BusinessSidebar({ businesses, activeId, onSelect, onAdd }: BusinessSidebarProps) {
  return (
    <div className="w-80 border-r border-vault-border/40 flex flex-col bg-vault-dark/20 h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Businesses</h2>
          <button 
            onClick={onAdd}
            className="w-8 h-8 rounded-lg bg-vault-green/10 flex items-center justify-center text-vault-green hover:bg-vault-green hover:text-black transition-all"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input 
            type="text" 
            placeholder="Search business..." 
            className="w-full bg-vault-dark/40 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-vault-green/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {businesses.map((biz) => (
          <button
            key={biz.id}
            onClick={() => onSelect(biz.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group",
              activeId === biz.id 
                ? "bg-vault-green/10 border border-vault-green/20" 
                : "hover:bg-white/[0.03] border border-transparent"
            )}
          >
            <div 
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border",
                activeId === biz.id ? "bg-vault-green/10 border-vault-green/30 text-vault-green" : "bg-white/5 border-white/10 text-gray-400"
              )}
            >
              <Briefcase size={18} />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className={cn("text-sm font-bold truncate", activeId === biz.id ? "text-white" : "text-gray-400")}>
                {biz.name}
              </p>
              <p className="text-[10px] font-medium text-gray-600 uppercase tracking-tight">{biz.type}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ArrowUpRight, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

interface ModulePreviewCardProps {
  title: string;
  count: string;
  value: string;
  delta: string;
  up: boolean;
  icon: LucideIcon;
  color: 'green' | 'blue' | 'purple' | 'orange';
  route: string;
  items: { label: string; value: string; sub?: string }[];
}

const COLOR_MAP = {
  green:  'text-vault-green bg-vault-green/10 border-vault-green/20',
  blue:   'text-blue-400 bg-blue-500/10 border-blue-500/20',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
};

export const ModulePreviewCard = memo(({
  title, count, value, delta, up, icon: Icon, color, route, items
}: ModulePreviewCardProps) => {
  const router = useRouter();

  return (
    <div 
      onClick={() => router.push(route)}
      className="cursor-pointer rounded-2xl border border-vault-border/60 bg-vault-card/40 flex flex-col h-full overflow-hidden
                 hover:border-vault-border/80 hover:bg-vault-card/60 transition-all group"
    >
      {/* Header */}
      <div className="p-5 border-b border-vault-border/40">
        <div className="flex items-center justify-between mb-4">
          <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center border', COLOR_MAP[color])}>
            <Icon size={20} />
          </div>
          <button className="h-8 w-8 rounded-lg bg-vault-dark/60 flex items-center justify-center text-gray-500
                             hover:text-white hover:bg-vault-dark transition-all opacity-0 group-hover:opacity-100">
            <ArrowUpRight size={16} />
          </button>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{count} items</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">{value}</span>
            <span className={cn('text-xs font-medium', up ? 'text-vault-green' : 'text-red-400')}>
              {up ? '↑' : '↓'} {delta}
            </span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 p-2 space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-all cursor-pointer">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-gray-300 truncate">{item.label}</p>
              {item.sub && <p className="text-[11px] text-gray-600 truncate">{item.sub}</p>}
            </div>
            <span className="text-[12px] font-semibold text-white flex-shrink-0">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-vault-border/40">
        <button className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-vault-green transition-all uppercase tracking-wider">
          Manage {title}
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
});

ModulePreviewCard.displayName = 'ModulePreviewCard';

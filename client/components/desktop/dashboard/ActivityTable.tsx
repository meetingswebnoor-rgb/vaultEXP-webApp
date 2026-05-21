'use client';

import { motion } from 'framer-motion';
import { History, ArrowUpRight, Download, Filter } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const TYPE_COLORS: Record<string, string> = {
  expense: 'bg-red-500/10 text-red-400',
  invoice: 'bg-vault-green/10 text-vault-green',
  wallet:  'bg-blue-500/10 text-blue-400',
  edit:    'bg-blue-500/10 text-blue-400',
  ai:      'bg-purple-500/10 text-purple-400',
  delete:  'bg-red-500/10 text-red-400',
  view:    'bg-gray-500/10 text-gray-400',
};

interface ActivityTableProps {
  data?: any[];
}

export function ActivityTable({ data = [] }: ActivityTableProps) {
  const fmt = (v: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  const getTimeAgo = (date: string) => {
    if (!date) return 'Unknown time';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';
    
    const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000);
    if (seconds < 0) return 'Just now'; // Future date? Just show now
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString();
  };
  return (
    <div className="rounded-2xl border border-vault-border/60 bg-vault-card/40 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-vault-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-vault-dark/60 flex items-center justify-center text-gray-500">
            <History size={16} />
          </div>
          <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <Filter size={14} />
          </button>
          <button className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-vault-border/20">
              <th className="px-6 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Entity</th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Action</th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vault-border/20">
            {data.map((act) => (
              <tr key={act.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-vault-dark border border-vault-border flex items-center justify-center text-[10px] font-bold text-gray-400">
                      {(act.business && typeof act.business === 'string') ? act.business[0] : '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-white truncate">{act.business || 'General'}</p>
                      <p className="text-[11px] text-gray-600 truncate">{act.label || act.description || 'System Activity'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize w-fit', TYPE_COLORS[act.type])}>
                      {act.type}
                    </span>
                    <span className={cn('text-[11px] font-bold', act.amount > 0 ? 'text-vault-green' : 'text-red-400')}>
                      {act.amount > 0 ? '+' : ''}{fmt(act.amount)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-[11px] text-gray-600">{getTimeAgo(act.date)}</span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={3} className="py-12 text-center text-xs text-gray-600 italic">No recent activity detected.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-vault-border/40 text-center">
        <button className="text-[11px] font-bold text-gray-500 hover:text-vault-green transition-all uppercase tracking-wider">
          View Audit Log
        </button>
      </div>
    </div>
  );
}

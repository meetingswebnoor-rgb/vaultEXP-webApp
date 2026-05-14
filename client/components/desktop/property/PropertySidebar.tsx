'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, Search, MapPin, TrendingUp, TrendingDown,
  ChevronRight, SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const TYPE_COLORS: Record<string, string> = {
  residential: '#3B82F6',
  commercial:  '#F59E0B',
  land:        '#10B981',
  industrial:  '#8B5CF6',
  'mixed-use': '#EC4899',
  vacation:    '#06B6D4',
  other:       '#6B7280',
};

function fmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toLocaleString()}`;
}

interface PropertyItem {
  _id: string;
  name: string;
  type: string;
  status: string;
  address: string;
  currentValue: number;
  purchaseValue: number;
  appreciation: number;
  tenantCount: number;
}

interface Props {
  properties: PropertyItem[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  stats?: { propertyCount: number; portfolioValue: number; appreciation: number };
}

export function PropertySidebar({ properties, activeId, onSelect, onAdd, stats }: Props) {
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState<string>('all');

  const filtered = useMemo(() => {
    return properties
      .filter(p => filter === 'all' || p.type === filter)
      .filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase())
      );
  }, [properties, search, filter]);

  const types = ['all', ...Array.from(new Set(properties.map(p => p.type)))];

  return (
    <div className="w-[320px] xl:w-[360px] border-r border-vault-border/30 flex flex-col bg-vault-dark/30 h-full flex-shrink-0">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-6 pt-8 pb-4 border-b border-vault-border/20">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[18px] font-bold font-display text-white">Properties</h2>
            <p className="text-[11px] text-gray-600 mt-0.5">{properties.length} assets managed</p>
          </div>
          <button
            onClick={onAdd}
            className="w-9 h-9 rounded-xl bg-vault-green/10 border border-vault-green/25 flex items-center justify-center text-vault-green hover:bg-vault-green hover:text-black transition-all duration-200"
          >
            <Plus size={17} strokeWidth={2.5} />
          </button>
        </div>

        {/* Portfolio mini-stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-vault-green/[0.07] border border-vault-green/15 rounded-xl p-3">
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Portfolio</p>
              <p className="text-[15px] font-bold text-vault-green font-display">{fmt(stats.portfolioValue)}</p>
            </div>
            <div
              className="rounded-xl p-3"
              style={{
                background: stats.appreciation >= 0 ? 'rgba(0,255,136,0.05)' : 'rgba(239,68,68,0.05)',
                border: stats.appreciation >= 0 ? '1px solid rgba(0,255,136,0.12)' : '1px solid rgba(239,68,68,0.12)',
              }}
            >
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Total Gain</p>
              <div className="flex items-center gap-1">
                {stats.appreciation >= 0
                  ? <TrendingUp size={12} className="text-vault-green" />
                  : <TrendingDown size={12} className="text-red-400" />}
                <p className={`text-[15px] font-bold font-display ${stats.appreciation >= 0 ? 'text-vault-green' : 'text-red-400'}`}>
                  {stats.appreciation}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={13} />
          <input
            type="text"
            placeholder="Search properties…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl py-2.5 pl-9 pr-4 text-[12px] text-white placeholder-gray-600 focus:outline-none focus:border-vault-green/30 transition-colors"
          />
        </div>
      </div>

      {/* ── Type filter chips ────────────────────────────────────── */}
      <div className="px-6 py-3 border-b border-vault-border/15 flex gap-1.5 overflow-x-auto scrollbar-none">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              'px-3 py-1.5 rounded-full text-[10px] font-bold capitalize whitespace-nowrap transition-all border',
              filter === t
                ? 'bg-vault-green text-black border-transparent'
                : 'bg-white/[0.04] border-white/[0.07] text-gray-500 hover:text-white hover:border-white/20'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Property list ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
        <AnimatePresence>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <Building2 size={32} className="text-gray-700" strokeWidth={1.4} />
              <p className="text-[12px] text-gray-600">No properties match</p>
            </div>
          )}

          {filtered.map((p) => {
            const color    = TYPE_COLORS[p.type] ?? '#6B7280';
            const isActive = p._id === activeId;
            return (
              <motion.button
                key={p._id}
                layoutId={`prop-${p._id}`}
                onClick={() => onSelect(p._id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all group border',
                  isActive
                    ? 'bg-white/[0.06] border-white/[0.12]'
                    : 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/[0.06]'
                )}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: isActive ? `${color}22` : `${color}12`,
                    border: `1px solid ${color}${isActive ? '45' : '25'}`,
                  }}
                >
                  <Building2 size={17} style={{ color }} strokeWidth={1.8} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-[13px] font-semibold truncate leading-tight', isActive ? 'text-white' : 'text-gray-300')}>
                    {p.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={9} className="text-gray-600 flex-shrink-0" />
                    <p className="text-[10px] text-gray-600 truncate">{p.address.split(',')[0]}</p>
                  </div>
                </div>

                {/* Value */}
                <div className="text-right flex-shrink-0">
                  <p className="text-[13px] font-bold text-white">{fmt(p.currentValue)}</p>
                  <p className={cn('text-[10px] font-bold', p.appreciation >= 0 ? 'text-vault-green' : 'text-red-400')}>
                    {p.appreciation >= 0 ? '+' : ''}{p.appreciation}%
                  </p>
                </div>

                <ChevronRight size={14} className={cn('flex-shrink-0 transition-colors', isActive ? 'text-gray-400' : 'text-gray-700 group-hover:text-gray-500')} />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

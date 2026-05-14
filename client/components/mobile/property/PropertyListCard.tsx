'use client';

import { motion } from 'framer-motion';
import { Building2, MapPin, ArrowRight, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TYPE_COLORS: Record<string, string> = {
  residential: '#3B82F6',
  commercial:  '#F59E0B',
  land:        '#10B981',
  industrial:  '#8B5CF6',
  'mixed-use': '#EC4899',
  vacation:    '#06B6D4',
  other:       '#6B7280',
};

interface PropertyListCardProps {
  id: string;
  name: string;
  type: string;
  address: string;
  currentValue: number;
  tenantCount?: number;
  status?: string;
}

export function PropertyListCard({
  id, name, type, address, currentValue, tenantCount = 0, status = 'active',
}: PropertyListCardProps) {
  const router = useRouter();
  const color  = TYPE_COLORS[type] ?? TYPE_COLORS.other;
  const shortAddress = address.length > 32 ? address.substring(0, 32) + '…' : address;

  const formatValue = (v: number) =>
    v >= 1_000_000
      ? `$${(v / 1_000_000).toFixed(2)}M`
      : v >= 1_000
      ? `$${(v / 1_000).toFixed(0)}K`
      : `$${v.toLocaleString()}`;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.975 }}
      onClick={() => router.push(`/property/${id}`)}
      className="w-full relative overflow-hidden rounded-[28px] p-5 text-left border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl group touch-callout-none select-none-touch"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-[40px] opacity-[0.12] pointer-events-none transition-opacity group-active:opacity-20"
        style={{ backgroundColor: color }}
      />

      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: `${color}18`,
              border: `1px solid ${color}35`,
              color,
            }}
          >
            <Building2 size={20} strokeWidth={1.8} />
          </div>

          {/* Name + type */}
          <div>
            <h3 className="text-[15px] font-bold text-white leading-tight font-display">{name}</h3>
            <p className="text-[11px] font-medium capitalize mt-0.5" style={{ color }}>
              {type}
            </p>
          </div>
        </div>

        {/* Status badge + arrow */}
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: status === 'active' ? 'rgba(0,255,136,0.1)' : 'rgba(107,114,128,0.12)',
              color: status === 'active' ? '#00FF88' : '#6B7280',
            }}
          >
            {status}
          </span>
          <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-gray-600 group-active:text-white transition-colors">
            <ArrowRight size={15} />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="flex items-center gap-1.5 mb-4">
        <MapPin size={11} className="text-gray-600 flex-shrink-0" />
        <p className="text-[12px] text-gray-500 leading-none">{shortAddress}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Value */}
        <div className="bg-white/[0.03] rounded-2xl p-3.5 border border-white/[0.05]">
          <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
            Current Value
          </p>
          <p className="text-[16px] font-bold font-display" style={{ color: '#00FF88' }}>
            {formatValue(currentValue)}
          </p>
        </div>

        {/* Tenants */}
        <div className="bg-white/[0.03] rounded-2xl p-3.5 border border-white/[0.05]">
          <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
            Tenants
          </p>
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-gray-400" />
            <p className="text-[16px] font-bold font-display text-white">
              {tenantCount}
            </p>
            <span className="text-[11px] text-gray-600">active</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/features/property/analyticsApi';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function fmt(v: number) {
  return `$${v.toLocaleString()}`;
}

function fmtMonth(m: string) {
  const [year, month] = m.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short' });
}

export function PropertyAnalytics({ propertyId }: { propertyId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', propertyId],
    queryFn: () => analyticsApi.get(propertyId),
  });

  if (isLoading) return <div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-vault-green/20 border-t-vault-green rounded-full animate-spin" /></div>;
  if (!data) return null;

  const maxVal = Math.max(...data.chartData.map(d => Math.max(d.rent, d.expenses)), 1000);

  return (
    <div className="space-y-6">
      {/* ── Metric Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: data.metrics.totalRent, icon: DollarSign, color: '#00FF88' },
          { label: 'Total Expenses', value: data.metrics.totalExpenses, icon: Wallet, color: '#EF4444' },
          { label: 'Net Profit', value: data.metrics.netProfit, icon: TrendingUp, color: '#3B82F6' },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.05] transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${m.color}15`, border: `1px solid ${m.color}30` }}>
                <m.icon size={14} style={{ color: m.color }} />
              </div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{m.label}</p>
            </div>
            <p className="text-[20px] font-bold text-white font-display">{fmt(m.value)}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Performance Chart ────────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[13px] font-bold text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-vault-green" /> 6-Month Performance
          </h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-vault-green" />
              <span className="text-[10px] text-gray-500 font-bold uppercase">Rent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[10px] text-gray-500 font-bold uppercase">Expenses</span>
            </div>
          </div>
        </div>

        <div className="h-48 flex items-end justify-between gap-2 px-2">
          {data.chartData.map((d, i) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-3">
              <div className="w-full flex items-end justify-center gap-1 h-full">
                {/* Rent Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.rent / maxVal) * 100}%` }}
                  className="w-full max-w-[24px] bg-gradient-to-t from-vault-green/20 to-vault-green/80 rounded-t-md relative group"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 border border-white/10 px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {fmt(d.rent)}
                  </div>
                </motion.div>
                {/* Expense Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.expenses / maxVal) * 100}%` }}
                  className="w-full max-w-[24px] bg-gradient-to-t from-red-500/20 to-red-500/80 rounded-t-md relative group"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 border border-white/10 px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {fmt(d.expenses)}
                  </div>
                </motion.div>
              </div>
              <span className="text-[10px] font-bold text-gray-600 uppercase">{fmtMonth(d.month)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

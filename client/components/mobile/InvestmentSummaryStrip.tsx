'use client';

/**
 * InvestmentSummaryStrip
 *
 * A lightweight, read-only strip displayed on the mobile/tablet dashboard
 * showing live investment stats: count, total value, and P/L.
 * Taps navigate to /investment.
 */

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Activity, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

export function InvestmentSummaryStrip() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['investments'],
    queryFn: async () => {
      const res = await api.get('/investment');
      return res.data;
    },
    staleTime: 60_000,
    retry: 1,
  });

  const investments  = data?.data    ?? [];
  const summary      = data?.summary ?? { totalValue: 0, totalProfitLoss: 0 };
  const isPositive   = summary.totalProfitLoss >= 0;

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(v);

  const fmtSigned = (v: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      signDisplay: 'always',
    }).format(v);

  if (isLoading) {
    return (
      <div className="mx-5 mb-4 h-[76px] rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      onClick={() => router.push('/investment')}
      className="mx-5 mb-4 cursor-pointer"
    >
      <div className="rounded-2xl bg-purple-500/[0.06] border border-purple-500/20 px-4 py-3.5 flex items-center gap-3 hover:bg-purple-500/[0.09] transition-all">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
          <Activity size={18} />
        </div>

        {/* Stats row */}
        <div className="flex-1 min-w-0 grid grid-cols-3 gap-2">
          {/* Count */}
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Assets</p>
            <p className="text-white font-display font-bold text-sm">{investments.length}</p>
          </div>

          {/* Total Value */}
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Value</p>
            <p className="text-white font-display font-bold text-sm truncate">{fmt(summary.totalValue)}</p>
          </div>

          {/* P/L */}
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">P / L</p>
            <p className={`font-display font-bold text-sm flex items-center gap-0.5 ${isPositive ? 'text-vault-green' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              <span className="truncate">{fmtSigned(summary.totalProfitLoss)}</span>
            </p>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight size={16} className="text-gray-600 flex-shrink-0" />
      </div>
    </motion.div>
  );
}

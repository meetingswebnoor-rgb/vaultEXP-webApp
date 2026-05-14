'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Edit2, Trash2, TrendingUp, TrendingDown,
  DollarSign, Hash, CalendarDays, Building2, Loader2,
  AlertCircle, Activity, Bitcoin, Briefcase, Box, X
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from '@/lib/api';
import { calculateInvestmentPerformance } from '@/lib/utils/investment';
import { EditInvestmentModal } from '@/components/investment/EditInvestmentModal';
import { ModalShell } from '@/components/investment/ModalShell';
import { useToast } from '@/components/ui/Toast';

const TYPE_LABELS: Record<string, string> = {
  stock: 'Stock / Equity',
  crypto: 'Cryptocurrency',
  mutual_fund: 'Mutual Fund / ETF',
  business: 'Private Business',
  manual_asset: 'Other Asset',
};

const TYPE_COLORS: Record<string, string> = {
  stock: '#00FF88',
  crypto: '#F59E0B',
  mutual_fund: '#3B82F6',
  business: '#FB923C',
  manual_asset: '#A855F7',
};

function TypeIcon({ type, size = 24 }: { type: string; size?: number }) {
  switch (type) {
    case 'stock': return <Activity size={size} />;
    case 'crypto': return <Bitcoin size={size} />;
    case 'business': return <Briefcase size={size} />;
    case 'mutual_fund': return <Building2 size={size} />;
    default: return <Box size={size} />;
  }
}

// Simple sparkline from purchase to now
function buildSparkline(amountInvested: number, currentValue: number) {
  const mid = amountInvested + (currentValue - amountInvested) * 0.5;
  return [
    { v: amountInvested },
    { v: amountInvested * 1.02 },
    { v: mid * 0.98 },
    { v: mid },
    { v: mid * 1.01 },
    { v: currentValue },
  ];
}

export default function InvestmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['investment', id],
    queryFn: async () => {
      const res = await api.get(`/api/investment/${id}`);
      return res.data.data;
    },
    enabled: !!id,
    retry: 1,
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/investment/${id}`);
      await queryClient.invalidateQueries({ queryKey: ['investments'] });
      showToast('Investment deleted', 'success');
      router.push('/investment');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete', 'error');
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-vault-darker">
        <Loader2 className="w-8 h-8 text-vault-green animate-spin" />
      </div>
    );
  }

  // ── Error ──
  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-vault-darker gap-4 px-6">
        <AlertCircle className="text-red-400" size={40} />
        <p className="text-white font-bold text-lg">Investment not found</p>
        <button
          onClick={() => router.push('/investment')}
          className="px-6 py-3 bg-vault-green text-black font-bold rounded-2xl"
        >
          Back to Investments
        </button>
      </div>
    );
  }

  const inv = data;
  const { profitLoss, percentage, isPositive } = calculateInvestmentPerformance(
    inv.currentValue || 0,
    inv.amountInvested || 0
  );
  const accentColor = TYPE_COLORS[inv.type] || '#00FF88';
  const sparkData = buildSparkline(inv.amountInvested || 0, inv.currentValue || 0);

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

  return (
    <div className="min-h-screen bg-vault-darker">
      {/* Edit Modal */}
      <EditInvestmentModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        investment={inv}
      />

      {/* Delete Confirm Modal */}
      <ModalShell
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        maxWidth="max-w-sm"
        zIndex={950}
      >
        <div className="p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} className="text-red-400" />
          </div>
          <h3 className="text-xl font-display font-bold text-white mb-2">Delete Investment?</h3>
          <p className="text-gray-400 text-sm mb-6">
            This will permanently remove <span className="text-white font-bold">{inv.name}</span> from your portfolio. This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-400 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </ModalShell>

      {/* Page Content */}
      <div className="max-w-2xl mx-auto px-5 py-8 pb-16">

        {/* ── Back + Actions Bar ── */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/investment')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold"
          >
            <ArrowLeft size={18} />
            Investments
          </motion.button>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm hover:bg-blue-500/20 transition-colors"
            >
              <Edit2 size={15} />
              Edit
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDeleteOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors"
            >
              <Trash2 size={15} />
              Delete
            </motion.button>
          </div>
        </div>

        {/* ── Hero Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-vault-dark border border-white/10 rounded-3xl p-6 mb-5"
        >
          {/* Ambient glow */}
          <div
            className="absolute -right-10 -top-10 w-48 h-48 rounded-full blur-[60px] opacity-20"
            style={{ backgroundColor: accentColor }}
          />

          <div className="flex items-start gap-4 relative z-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center border flex-shrink-0"
              style={{ backgroundColor: `${accentColor}15`, borderColor: `${accentColor}30`, color: accentColor }}
            >
              <TypeIcon type={inv.type} size={26} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
                {TYPE_LABELS[inv.type] || inv.type}
              </p>
              <h1 className="text-2xl font-display font-bold text-white truncate">{inv.name}</h1>
              {inv.platform && (
                <p className="text-gray-500 text-sm mt-0.5">via {inv.platform}</p>
              )}
            </div>
          </div>

          {/* Current Value */}
          <div className="mt-6 relative z-10">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Current Value</p>
            <p className="text-5xl font-display font-bold text-white">{fmt(inv.currentValue)}</p>
          </div>

          {/* P/L Badge */}
          <div className="flex items-center gap-3 mt-4 relative z-10">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold ${isPositive ? 'bg-vault-green/15 text-vault-green' : 'bg-red-500/15 text-red-400'}`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isPositive ? '+' : ''}{fmt(profitLoss)}
              <span className="opacity-75">({isPositive ? '+' : ''}{percentage.toFixed(2)}%)</span>
            </div>
            <span className="text-gray-600 text-xs">All-time return</span>
          </div>
        </motion.div>

        {/* ── Sparkline Chart ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-vault-dark border border-white/10 rounded-3xl p-5 mb-5"
        >
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Performance Overview</p>
          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={accentColor} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ color: accentColor, fontWeight: 'bold' }}
                  formatter={(val: any) => [fmt(val as number), 'Value']}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={accentColor}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#detailGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── Stats Grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mb-5"
        >
          {[
            { label: 'Amount Invested', value: fmt(inv.amountInvested), icon: <DollarSign size={16} /> },
            { label: 'Quantity', value: inv.quantity ?? '—', icon: <Hash size={16} /> },
            {
              label: 'Purchase Date',
              value: inv.purchaseDate
                ? new Date(inv.purchaseDate).toLocaleDateString('en-US', { dateStyle: 'medium' })
                : '—',
              icon: <CalendarDays size={16} />
            },
            { label: 'Platform', value: inv.platform || '—', icon: <Building2 size={16} /> },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="bg-vault-dark border border-white/[0.06] rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
              </div>
              <p className="text-white font-bold font-display truncate">{value}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Notes ── */}
        {inv.notes && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-vault-dark border border-white/[0.06] rounded-2xl p-5"
          >
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Notes</p>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{inv.notes}</p>
          </motion.div>
        )}

      </div>
    </div>
  );
}

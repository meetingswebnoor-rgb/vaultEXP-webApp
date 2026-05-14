'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, TrendingDown, Building2, Briefcase,
  Vault, ArrowUpRight, FileText, Calendar, PieChart, Landmark, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ── Data ──────────────────────────────────────────────────────
const MODULES = [
  { id: 'businesses',  label: 'Businesses',      icon: Briefcase,  color: 'rgba(251,146,60,1)',   bg: 'from-orange-500/15 to-orange-600/5',   border: 'border-orange-500/20', route: '/business' },
  { id: 'properties',  label: 'Properties',      icon: Building2,  color: 'rgba(59,130,246,1)',   bg: 'from-blue-500/15 to-blue-600/5',       border: 'border-blue-500/20',   route: '/property' },
  { id: 'investments', label: 'Investments',     icon: TrendingUp, color: 'rgba(139,92,246,1)',   bg: 'from-purple-500/15 to-purple-600/5',   border: 'border-purple-500/20', route: '/investment' },
  { id: 'wallet',      label: 'Wallet',          icon: Vault,      color: 'rgba(0,255,136,1)',    bg: 'from-vault-green/15 to-vault-green/5', border: 'border-vault-green/20',route: '/wallet' },
  { id: 'documents',   label: 'Documents',       icon: FileText,   color: 'rgba(244,63,94,1)',    bg: 'from-rose-500/15 to-rose-600/5',       border: 'border-rose-500/20',   route: '/documents' },
  { id: 'calendar',    label: 'Calendar',        icon: Calendar,   color: 'rgba(6,182,212,1)',    bg: 'from-cyan-500/15 to-cyan-600/5',       border: 'border-cyan-500/20',   route: '/calendar' },
  { id: 'personal',    label: 'Personal Finance',icon: PieChart,   color: 'rgba(234,179,8,1)',    bg: 'from-yellow-500/15 to-yellow-600/5',   border: 'border-yellow-500/20', route: '/dashboard' },
  { id: 'tax',         label: 'Tax Strategist',  icon: Landmark,   color: 'rgba(99,102,241,1)',   bg: 'from-indigo-500/15 to-indigo-600/5',   border: 'border-indigo-500/20', route: '/dashboard' },
  { id: 'ai',          label: 'AI Assistant',    icon: Sparkles,   color: 'rgba(0,255,136,1)',    bg: 'from-emerald-500/15 to-emerald-600/5', border: 'border-emerald-500/20',route: '/ai' },
];

const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show:   { opacity: 1, scale: 1, transition: { type: 'spring', damping: 20, stiffness: 280 } },
};

export function ModuleCards() {
  const router = useRouter();

  return (
    <div className="px-5 mt-6 mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white">Modules</h2>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 gap-3"
      >
        {MODULES.map((mod) => {
          const Icon = mod.icon;

          return (
            <motion.button
              key={mod.id}
              id={mod.id}
              onClick={() => router.push(mod.route)}
              variants={cardVariants}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'group relative flex flex-col items-center justify-center gap-3 rounded-3xl p-5',
                `bg-gradient-to-br ${mod.bg}`,
                `border ${mod.border}`,
                'backdrop-blur-sm transition-all active:brightness-90 text-center'
              )}
              style={{ boxShadow: `0 8px 30px ${mod.color.replace('1)', '0.08)')}` }}
            >
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg mb-1"
                style={{ 
                  backgroundColor: mod.color.replace('1)', '0.1)'), 
                  border: `1px solid ${mod.color.replace('1)', '0.2)')}` 
                }}
              >
                <Icon size={24} style={{ color: mod.color }} strokeWidth={1.5} />
              </div>

              {/* Label */}
              <span className="text-[12px] font-semibold text-white/90 leading-tight">
                {mod.label}
              </span>

              {/* Arrow Indicator */}
              <div 
                className="absolute top-3 right-3 text-white/30 transition-all duration-300 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              >
                <ArrowUpRight size={14} strokeWidth={2.5} />
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

// ── Recent Transactions (bonus sub-component) ──────────────────
const TRANSACTIONS = [
  { label: 'Added to Finance Vault',  amount: '+$2,400', time: '2m ago',  up: true  },
  { label: 'Withdrawal – Property',   amount: '-$800',   time: '1h ago',  up: false },
  { label: 'Exchange – USD to EUR',   amount: '$1,200',  time: '3h ago',  up: null  },
];

interface RecentTransactionsProps {
  data?: any[];
}

export function RecentTransactions({ data = [] }: RecentTransactionsProps) {
  const fmt = (v: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="px-5 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white">Recent</h2>
        <button className="text-[11px] text-vault-green font-medium hover:underline">
          See all
        </button>
      </div>

      <div className="space-y-2">
        {data.map((act, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5
                       bg-vault-card border border-vault-border"
          >
            {/* Icon */}
            <div className={cn(
              'h-8 w-8 rounded-xl flex-shrink-0 flex items-center justify-center',
              act.amount > 0 ? 'bg-vault-green/10' : 'bg-red-500/10'
            )}>
              {act.amount > 0 
                ? <ArrowUpRight size={14} className="text-vault-green" /> 
                : <TrendingDown size={14} className="text-red-400" />
              }
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-white truncate">{act.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{getTimeAgo(act.date)}</p>
            </div>

            <span className={cn(
              'text-[12px] font-bold flex-shrink-0',
              act.amount > 0 ? 'text-vault-green' : 'text-red-400'
            )}>
              {act.amount > 0 ? '+' : ''}{fmt(act.amount)}
            </span>
          </motion.div>
        ))}
        {data.length === 0 && (
          <div className="py-8 text-center text-xs text-gray-600 italic">No activity yet.</div>
        )}
      </div>
    </div>
  );
}

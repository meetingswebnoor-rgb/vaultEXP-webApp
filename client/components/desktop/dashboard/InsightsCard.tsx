'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ArrowUpRight, Zap, Shield, AlertTriangle } from 'lucide-react';

const INSIGHTS = [
  {
    icon: TrendingUp,
    color: 'text-vault-green',
    bg: 'bg-vault-green/10',
    border: 'border-vault-green/20',
    text: 'Finance vault outperformed benchmark by 4.2% this month.',
  },
  {
    icon: Shield,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'Property diversification looks optimal across 4 assets.',
  },
  {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'Business vault allocation is below your 20% target.',
  },
  {
    icon: Zap,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'Consider rebalancing: property has grown to 48% of total.',
  },
];

const SCORE_SEGMENTS = [
  { label: 'Growth',      score: 82, color: '#00FF88' },
  { label: 'Stability',   score: 74, color: '#3B82F6' },
  { label: 'Diversif.',   score: 68, color: '#818CF8' },
];

export function InsightsCard() {
  return (
    <div className="rounded-2xl border border-vault-border/60 overflow-hidden
                    bg-gradient-to-br from-vault-card to-vault-darker flex flex-col"
         style={{ boxShadow: '0 4px 40px rgba(0,0,0,0.3)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-vault-border/40">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-vault-green/10 border border-vault-green/20
                          flex items-center justify-center">
            <Sparkles size={15} className="text-vault-green" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Insights</p>
            <p className="text-[10px] text-gray-500">Powered by VaultAI</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-vault-green border border-vault-green/25
                         bg-vault-green/10 rounded-full px-2 py-0.5">
          Live
        </span>
      </div>

      {/* Health Score */}
      <div className="px-6 py-5 border-b border-vault-border/40">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Portfolio Health
          </p>
          <span className="font-display text-2xl font-bold text-vault-green">74</span>
        </div>
        <div className="space-y-2.5">
          {SCORE_SEGMENTS.map((s, i) => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-gray-500">{s.label}</span>
                <span className="text-[11px] font-semibold text-white">{s.score}</span>
              </div>
              <div className="h-1 rounded-full bg-vault-darker overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: s.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${s.score}%` }}
                  transition={{ duration: 0.9, delay: 0.15 * i, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insight bullets */}
      <div className="flex-1 px-4 py-4 space-y-2.5">
        {INSIGHTS.map((ins, i) => {
          const Icon = ins.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i }}
              className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 border ${ins.border} ${ins.bg}`}
            >
              <div className={`flex-shrink-0 mt-0.5 ${ins.color}`}>
                <Icon size={13} strokeWidth={2} />
              </div>
              <p className="text-[12px] text-gray-300 leading-relaxed">{ins.text}</p>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="px-6 pb-5">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                           bg-vault-green/10 border border-vault-green/20 text-vault-green
                           text-[13px] font-semibold hover:bg-vault-green/15 transition-all group">
          <Sparkles size={13} />
          Full AI Report
          <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

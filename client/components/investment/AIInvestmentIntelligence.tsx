'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingUp, TrendingDown, Shield, Bot, Download,
  RefreshCw, AlertTriangle, ChevronRight, HelpCircle, Target, Award
} from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Props {
  onRefreshPortfolio?: () => void;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const trendColor = (trend: string) => {
  if (trend === 'bullish') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (trend === 'bearish') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
};

const riskColor = (risk: string) => {
  if (risk === 'high') return 'bg-red-500/15 border-red-500/20 text-red-400';
  if (risk === 'medium') return 'bg-amber-500/15 border-amber-500/20 text-amber-400';
  return 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400';
};

export function AIInvestmentIntelligence({ onRefreshPortfolio }: Props) {
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const router                = useRouter();

  const fetchIntelligence = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/investment/ai-intelligence');
      setData(res.data?.data);
      if (onRefreshPortfolio) onRefreshPortfolio();
    } catch {
      setError('Failed to audit investment portfolio.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskAI = () => {
    router.push('/ai?context=investment');
  };

  const downloadReport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `VaultEXP_Investment_AI_Report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── State: Empty / Idle ── */
  if (!data && !loading) {
    return (
      <div className="bg-gradient-to-br from-vault-green/10 via-emerald-950/10 to-transparent border border-vault-green/20 rounded-[28px] p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-vault-green/10 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6 text-vault-green" />
        </div>
        <h3 className="text-[16px] font-semibold text-white">AI Investment Intelligence</h3>
        <p className="text-zinc-400 text-xs max-w-xs mx-auto leading-relaxed">
          Unlock predictive market trends, overall diversification audits, ROI evaluations, and personalized rebalancing suggestions.
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={fetchIntelligence}
          className="px-5 py-2.5 bg-vault-green hover:bg-emerald-400 text-black rounded-xl text-xs font-bold transition-colors flex items-center gap-2 mx-auto"
        >
          <Sparkles className="w-3.5 h-3.5" /> Analyze Portfolio
        </motion.button>
      </div>
    );
  }

  /* ── State: Loading ── */
  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-[28px] p-8 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-vault-green animate-spin" />
        <p className="text-zinc-400 text-xs">AI is computing gains/losses, asset weightings, and ROI...</p>
      </div>
    );
  }

  /* ── State: Error ── */
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-[20px] p-5 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
        <p className="text-xs text-red-300">{error}</p>
        <button onClick={fetchIntelligence} className="ml-auto text-xs text-red-400 hover:text-white flex items-center gap-1">
          <RefreshCw className="w-3 h-3 animate-spin" /> Retry
        </button>
      </div>
    );
  }

  const { metrics, distribution, intelligence, generatedAt } = data;
  const isPositive = parseFloat(metrics.totalProfit) >= 0;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Portfolio intelligence</p>
          <p className="text-[9px] text-gray-600 mt-0.5">Audited {new Date(generatedAt).toLocaleTimeString()}</p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={handleAskAI} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-lg text-zinc-300 transition-colors">
            <Bot className="w-3.5 h-3.5 text-vault-green" /> Ask AI
          </button>
          <button onClick={downloadReport} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-lg text-zinc-300 transition-colors">
            <Download className="w-3.5 h-3.5 text-blue-400" /> Export
          </button>
          <button onClick={fetchIntelligence} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-lg text-zinc-300 transition-colors">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      {/* ── Core Audit Panel ── */}
      <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-950/20 border border-white/[0.06] rounded-[24px] p-5 space-y-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-vault-green" />
            <span className="text-[10px] font-bold text-vault-green uppercase tracking-widest">Portfolio Performance Audit</span>
          </div>
          <p className="text-zinc-200 text-xs leading-relaxed">{intelligence.performanceSummary}</p>
        </div>

        {/* Diversification Score Section */}
        <div className="pt-4 border-t border-white/[0.05] grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Score Badge */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-vault-green/10 border border-vault-green/15 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-vault-green" />
            </div>
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">Diversification</p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-white">{intelligence.diversificationAnalysis.score}</span>
                <span className="text-[10px] text-gray-500">/100</span>
              </div>
            </div>
          </div>

          {/* Diversification Status */}
          <div className="md:col-span-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 capitalize">
                {intelligence.diversificationAnalysis.status.replace('_', ' ')}
              </span>
              <span className="text-[9px] text-gray-500">Asset classes: {Object.keys(distribution).length}</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed">{intelligence.diversificationAnalysis.feedback}</p>
          </div>
        </div>
      </div>

      {/* ── Asset Class Insights ── */}
      <div>
        <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-vault-green" /> Asset Class Outlooks
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {intelligence.assetClassInsights.map((insight: any, i: number) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white capitalize">{insight.type.replace(/_/g, ' ')}</span>
                <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${trendColor(insight.trend)}`}>
                  {insight.trend}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">{insight.insights}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Investment Intelligence Recommendations ── */}
      <div>
        <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-blue-400" /> Strategic Recommendations
        </h4>
        <div className="space-y-2.5">
          {intelligence.investmentRecommendations.map((rec: any, i: number) => (
            <div key={i} className="bg-white/[0.01] border border-white/[0.06] hover:border-white/10 rounded-xl p-3 flex justify-between gap-4 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{rec.action}</span>
                  <span className="text-[8px] text-gray-500 font-bold uppercase bg-white/[0.04] px-1.5 py-0.5 rounded">
                    {rec.assetClass.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">{rec.reasoning}</p>
              </div>
              <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded h-fit border ${riskColor(rec.riskLevel)}`}>
                {rec.riskLevel} Risk
              </span>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
}

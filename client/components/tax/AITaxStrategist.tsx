'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, FileText, Scale, ShieldAlert, Bot, Download,
  RefreshCw, AlertTriangle, ChevronRight, HelpCircle, CheckCircle, Percent
} from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Props {
  onRefreshDeductions?: () => void;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export function AITaxStrategist({ onRefreshDeductions }: Props) {
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const router                = useRouter();

  const fetchStrategy = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/tax/advice');
      setData(res.data?.data);
      if (onRefreshDeductions) onRefreshDeductions();
    } catch {
      setError('Failed to audit tax profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskAI = () => {
    router.push('/ai?context=tax');
  };

  const downloadReport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `VaultEXP_AI_Tax_Strategy.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Idle State ── */
  if (!data && !loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-950/20 via-indigo-900/10 to-transparent border border-indigo-500/20 rounded-[28px] p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6 text-indigo-400" />
        </div>
        <h3 className="text-[16px] font-semibold text-white">AI Tax Strategist</h3>
        <p className="text-zinc-400 text-xs max-w-xs mx-auto leading-relaxed">
          Optimize your business and properties legally. Identify missed business deductions, project write-offs, and construct an optimized tax strategy.
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={fetchStrategy}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 mx-auto"
        >
          <Sparkles className="w-3.5 h-3.5" /> Analyze Tax Exposure
        </motion.button>
      </div>
    );
  }

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-[28px] p-8 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-zinc-400 text-xs">Auditing write-offs, active businesses, real estate, and capital gains...</p>
      </div>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-[20px] p-5 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
        <p className="text-xs text-red-300">{error}</p>
        <button onClick={fetchStrategy} className="ml-auto text-xs text-red-400 hover:text-white flex items-center gap-1">
          <RefreshCw className="w-3 h-3 animate-spin" /> Retry
        </button>
      </div>
    );
  }

  const { metrics, strategy, generatedAt } = data;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">AI Strategy Center</p>
          <p className="text-[9px] text-gray-600 mt-0.5">Audited {new Date(generatedAt).toLocaleTimeString()}</p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={handleAskAI} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-lg text-zinc-300 transition-colors">
            <Bot className="w-3.5 h-3.5 text-indigo-400" /> Ask AI
          </button>
          <button onClick={downloadReport} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-lg text-zinc-300 transition-colors">
            <Download className="w-3.5 h-3.5 text-blue-400" /> Export
          </button>
          <button onClick={fetchStrategy} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-lg text-zinc-300 transition-colors">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      {/* ── Protective CPA Disclaimer System ── */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-[20px] p-4 flex gap-3.5 items-start">
        <Scale className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">CPA & Compliance Disclaimer</h4>
          <p className="text-[10px] text-amber-300/80 leading-relaxed">{strategy.legalDisclaimer}</p>
        </div>
      </div>

      {/* ── Summary & Metrics Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-[22px] p-4 space-y-1.5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
          <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Claimed Deductions</p>
          <p className="text-xl font-bold text-indigo-400">{fmt(metrics.claimedDeductions)}</p>
          <p className="text-[9px] text-zinc-400 leading-relaxed">Actively flagged in Deduction Center</p>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-[22px] p-4 space-y-1.5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl" />
          <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Potential Deductions</p>
          <p className="text-xl font-bold text-emerald-400">{fmt(metrics.potentialDeductions)}</p>
          <p className="text-[9px] text-zinc-400 leading-relaxed">Identified for conversion review</p>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-[22px] p-4 space-y-1.5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl" />
          <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Capital Gains</p>
          <p className="text-xl font-bold text-white">{fmt(metrics.realizedGains)}</p>
          <p className="text-[9px] text-zinc-400 leading-relaxed">Annual taxable investment returns</p>
        </div>
      </div>

      {/* ── AI Tax Strategy Audit Summary ── */}
      <div className="bg-gradient-to-br from-indigo-950/40 to-blue-950/20 border border-indigo-500/20 rounded-[24px] p-5">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">AI Tax Optimization Audit</span>
        </div>
        <p className="text-zinc-200 text-xs leading-relaxed">{strategy.taxSummary}</p>
      </div>

      {/* ── Actionable Strategic Deductions ── */}
      <div>
        <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Identified Deductions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {strategy.deductionsIdentified.map((ded: any, i: number) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex justify-between gap-4 items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white capitalize">{ded.category.replace(/_/g, ' ')}</span>
                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    ded.status === 'claimed' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' : 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                  }`}>
                    {ded.status}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">{ded.description}</p>
              </div>
              <span className="text-xs font-bold text-emerald-400">{fmt(ded.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tax-Saving Opportunities ── */}
      <div>
        <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Percent className="w-3.5 h-3.5 text-indigo-400" /> Legal Optimization Strategies
        </h4>
        <div className="space-y-3.5">
          {strategy.opportunities.map((opt: any, i: number) => (
            <div key={i} className="bg-white/[0.01] border border-white/[0.06] hover:border-white/10 rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-5 transition-colors">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-bold text-white">{opt.strategy}</span>
                  <span className="text-[8px] text-gray-500 font-bold bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.05]">
                    {opt.legalityContext}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Implementation Tasks</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {opt.actionSteps.map((step: string, j: number) => (
                      <li key={j} className="text-[10px] text-zinc-300">{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex flex-col justify-center items-center h-fit min-w-[120px]">
                <p className="text-[8px] text-zinc-400 uppercase font-bold tracking-wider">Est. Savings</p>
                <p className="text-sm font-bold text-emerald-400">{fmt(opt.potentialSavings)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
}

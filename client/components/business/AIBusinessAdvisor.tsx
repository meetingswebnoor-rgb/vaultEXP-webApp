'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingUp, TrendingDown, AlertTriangle, Lightbulb,
  DollarSign, FileText, Loader2, RefreshCw, Download, ChevronDown, ChevronUp, Bot,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Props {
  businessId: string;
  businessName: string;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const impactColor = (impact: string) => {
  if (impact === 'high')   return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
  if (impact === 'medium') return 'bg-amber-500/10  border-amber-500/20  text-amber-400';
  return                          'bg-blue-500/10   border-blue-500/20   text-blue-400';
};

export function AIBusinessAdvisor({ businessId, businessName }: Props) {
  const [data, setData]         = useState<any>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const router                  = useRouter();

  const toggleSection = (key: string) =>
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const fetchAdvice = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/business/${businessId}/ai-advice`);
      setData(res.data?.data);
    } catch {
      setError('Failed to generate AI advice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskAI = () => {
    router.push(`/ai?context=business&id=${businessId}`);
  };

  const downloadReport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${businessName.replace(/\s+/g, '_')}_AI_Report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Not yet generated ── */
  if (!data && !loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border border-indigo-500/30 rounded-2xl p-8 flex flex-col items-center text-center space-y-4">
        <div className="p-4 bg-indigo-500/20 rounded-2xl">
          <Sparkles className="w-10 h-10 text-indigo-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">AI Business Advisor</h3>
        <p className="text-zinc-400 text-sm max-w-sm">
          Let VaultAI analyze <span className="text-white font-medium">{businessName}</span>&apos;s revenue, expenses, invoices
          and profit margins to surface actionable insights.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={fetchAdvice}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> Generate AI Report
        </motion.button>
      </div>
    );
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-10 flex flex-col items-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
        <p className="text-zinc-400 text-sm">VaultAI is analyzing <span className="text-white font-medium">{businessName}</span>…</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-center gap-4">
        <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
        <p className="text-sm text-red-300">{error}</p>
        <button onClick={fetchAdvice} className="ml-auto text-xs text-red-400 hover:text-white flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  const { metrics, advice, generatedAt } = data;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/20 rounded-lg"><Sparkles className="w-5 h-5 text-indigo-400" /></div>
          <div>
            <h3 className="font-semibold text-white">AI Business Advisor</h3>
            <p className="text-xs text-zinc-500">
              Generated {new Date(generatedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAskAI}
            className="flex items-center gap-2 px-3 py-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-zinc-300 transition-colors">
            <Bot className="w-4 h-4" /> Ask AI
          </button>
          <button onClick={downloadReport}
            className="flex items-center gap-2 px-3 py-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-zinc-300 transition-colors">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button onClick={fetchAdvice}
            className="flex items-center gap-2 px-3 py-2 text-xs bg-indigo-600/40 hover:bg-indigo-600/60 border border-indigo-500/30 rounded-xl text-indigo-300 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* ── Key Metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue',   value: fmt(metrics.totalRevenue),   icon: TrendingUp,   color: 'text-emerald-400' },
          { label: 'Total Expenses',  value: fmt(metrics.totalExpenses),  icon: TrendingDown, color: 'text-red-400'     },
          { label: 'Profit Margin',   value: `${metrics.profitMargin}`,   icon: DollarSign,   color: 'text-blue-400'    },
          { label: 'Overdue Invoices',value: fmt(metrics.overdueInvoices),icon: FileText,     color: 'text-amber-400'   },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className={`mb-2 ${color}`}><Icon className="w-5 h-5" /></div>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Health Summary ── */}
      <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Sparkles className="w-28 h-28 text-indigo-400" />
        </div>
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Business Health Summary</p>
        <p className="text-zinc-200 leading-relaxed text-sm">{advice.healthSummary}</p>
      </div>

      {/* ── Revenue Trends ── */}
      {advice.revenueTrends?.length > 0 && (
        <CollapsibleSection
          id="trends" label="Revenue Trends" icon={TrendingUp} iconColor="text-emerald-400"
          expanded={expanded.trends} toggle={() => toggleSection('trends')}
        >
          <ul className="space-y-2">
            {advice.revenueTrends.map((trend: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                {trend}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* ── Cost Savings ── */}
      {advice.costSavings?.length > 0 && (
        <CollapsibleSection
          id="savings" label="Cost-Saving Opportunities" icon={DollarSign} iconColor="text-amber-400"
          expanded={expanded.savings} toggle={() => toggleSection('savings')}
        >
          <div className="space-y-3">
            {advice.costSavings.map((item: any, i: number) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${impactColor(item.potentialImpact)}`}>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-60">{item.category}</p>
                  <p className="text-sm mt-0.5">{item.suggestion}</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full border border-current opacity-70 flex-shrink-0">
                  {item.potentialImpact}
                </span>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* ── Improvements ── */}
      {advice.improvements?.length > 0 && (
        <CollapsibleSection
          id="improvements" label="Strategic Improvements" icon={Lightbulb} iconColor="text-blue-400"
          expanded={expanded.improvements} toggle={() => toggleSection('improvements')}
        >
          <div className="space-y-3">
            {advice.improvements.map((item: any, i: number) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
                <p className="text-sm text-zinc-400">{item.description}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </motion.div>
  );
}

/* ── Reusable collapsible section ── */
function CollapsibleSection({
  id, label, icon: Icon, iconColor, expanded, toggle, children,
}: {
  id: string; label: string; icon: any; iconColor: string;
  expanded: boolean; toggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <span className="font-semibold text-white text-sm">{label}</span>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-zinc-500" />
          : <ChevronDown className="w-4 h-4 text-zinc-500" />}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

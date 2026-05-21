'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingUp, AlertTriangle, ShieldCheck, HelpCircle,
  Download, RefreshCw, Bot, ChevronDown, ChevronUp, DollarSign, Calendar
} from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Props {
  propertyId: string;
  propertyName: string;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const riskBadgeColor = (risk: string) => {
  if (risk === 'high')   return 'bg-red-500/10 border-red-500/20 text-red-400';
  if (risk === 'medium') return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
  return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
};

export function AIPropertyAdvisor({ propertyId, propertyName }: Props) {
  const [data, setData]         = useState<any>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    tenants: true,
    leases: true,
    optimizations: true
  });
  const router                  = useRouter();

  const toggleSection = (key: string) =>
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const fetchAdvice = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/property/${propertyId}/ai-advice`);
      setData(res.data?.data);
    } catch {
      setError('Failed to generate AI Property Insights.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskAI = () => {
    router.push(`/ai?context=property&id=${propertyId}`);
  };

  const downloadReport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${propertyName.replace(/\s+/g, '_')}_Property_AI_Report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Not yet generated ── */
  if (!data && !loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-900/30 to-blue-900/20 border border-indigo-500/30 rounded-[24px] p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6 text-indigo-400" />
        </div>
        <h3 className="text-[16px] font-semibold text-white">AI Property Insights</h3>
        <p className="text-zinc-400 text-xs max-w-xs mx-auto leading-relaxed">
          Let VaultAI analyze tenant risk profiles, rental income potential, lease expirations, and suggest optimized pricing.
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={fetchAdvice}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 mx-auto"
        >
          <Sparkles className="w-3.5 h-3.5" /> Analyze Property
        </motion.button>
      </div>
    );
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-8 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-zinc-400 text-xs">AI is auditing tenants, leases, and historical rents...</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
        <p className="text-xs text-red-300">{error}</p>
        <button onClick={fetchAdvice} className="ml-auto text-xs text-red-400 hover:text-white flex items-center gap-1">
          <RefreshCw className="w-3 h-3 animate-spin" /> Retry
        </button>
      </div>
    );
  }

  const { metrics, advice, generatedAt } = data;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Property AI advisor</p>
          <p className="text-[9px] text-gray-600 mt-0.5">Updated {new Date(generatedAt).toLocaleTimeString()}</p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={handleAskAI} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-lg text-zinc-300 transition-colors">
            <Bot className="w-3.5 h-3.5 text-indigo-400" /> Ask AI
          </button>
          <button onClick={downloadReport} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-lg text-zinc-300 transition-colors">
            <Download className="w-3.5 h-3.5 text-blue-400" /> Export
          </button>
        </div>
      </div>

      {/* ── Performance Summary ── */}
      <div className="bg-gradient-to-br from-indigo-950/40 to-blue-950/20 border border-indigo-500/20 rounded-[20px] p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Performance Audit</span>
        </div>
        <p className="text-zinc-200 text-xs leading-relaxed">{advice.performanceSummary}</p>
      </div>

      {/* ── Tenant Risk Analysis ── */}
      <CollapsibleSection
        id="tenants" label="Tenant Risk Analysis" icon={ShieldCheck} iconColor="text-emerald-400"
        expanded={expanded.tenants} toggle={() => toggleSection('tenants')}
      >
        {advice.tenantRiskAnalysis?.length === 0 ? (
          <p className="text-xs text-zinc-500">All tenants evaluated as standard risk levels.</p>
        ) : (
          <div className="space-y-2.5">
            {advice.tenantRiskAnalysis.map((risk: any, i: number) => (
              <div key={i} className={`p-3 rounded-xl border ${riskBadgeColor(risk.riskLevel)}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white">{risk.tenantName}</span>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border border-current">
                    {risk.riskLevel} Risk
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-300"><span className="font-semibold text-zinc-400">Risk Factors:</span> {risk.factors.join(', ')}</p>
                  <p className="text-[10px] text-zinc-300"><span className="font-semibold text-zinc-400">Mitigation:</span> {risk.mitigation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* ── Lease Expirations ── */}
      <CollapsibleSection
        id="leases" label="Lease AI Summaries" icon={Calendar} iconColor="text-blue-400"
        expanded={expanded.leases} toggle={() => toggleSection('leases')}
      >
        {advice.leaseExpirations?.length === 0 ? (
          <p className="text-xs text-zinc-500">No upcoming lease expirations detected.</p>
        ) : (
          <div className="space-y-2">
            {advice.leaseExpirations.map((lease: any, i: number) => (
              <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white">{lease.tenantName}</p>
                  <p className="text-[10px] text-zinc-400">Lease End: {new Date(lease.leaseEndDate).toLocaleDateString()}</p>
                  <p className="text-[10px] text-indigo-300 mt-1">{lease.recommendation}</p>
                </div>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  lease.status === 'expired' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {lease.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* ── Rent Optimizations ── */}
      <CollapsibleSection
        id="optimizations" label="Rent Optimizations" icon={TrendingUp} iconColor="text-indigo-400"
        expanded={expanded.optimizations} toggle={() => toggleSection('optimizations')}
      >
        {advice.rentOptimizations?.length === 0 ? (
          <p className="text-xs text-zinc-500">Current rent yields are fully optimized.</p>
        ) : (
          <div className="space-y-2.5">
            {advice.rentOptimizations.map((opt: any, i: number) => (
              <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-white">Suggested Rent Adjustment</span>
                  <span className="text-[11px] font-bold text-emerald-400">+{fmt(opt.estimatedImpactAnnual)}/yr</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                    <p className="text-[9px] text-zinc-500 uppercase">Current Rent</p>
                    <p className="text-xs font-semibold text-white">{fmt(opt.currentRent)}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                    <p className="text-[9px] text-zinc-500 uppercase">Suggested Rent</p>
                    <p className="text-xs font-semibold text-emerald-400">{fmt(opt.suggestedRent)}</p>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">{opt.reasoning}</p>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

    </motion.div>
  );
}

function CollapsibleSection({
  id, label, icon: Icon, iconColor, expanded, toggle, children,
}: {
  id: string; label: string; icon: any; iconColor: string;
  expanded: boolean; toggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-[18px] overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <span className="font-semibold text-white text-xs">{label}</span>
        </div>
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
          : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

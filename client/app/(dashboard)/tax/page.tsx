'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils/cn';
import { 
  Scale, Sparkles, ShieldCheck, AlertTriangle, BarChart3, 
  FolderHeart, CheckCircle2, XCircle, Bot, Clock
} from 'lucide-react';

type TabType = 'overview' | 'deductions' | 'quarterly' | 'compliance';

export default function TaxStrategistPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const [strategy, setStrategy] = useState<any>(null);
  const [deductions, setDeductions] = useState<any>(null);
  const [quarterly, setQuarterly] = useState<any>(null);
  const [audit, setAudit] = useState<any>(null);
  
  const [loadingStrategy, setLoadingStrategy] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    const fetchDeductions = async () => {
      try {
        const res = await api.get('/api/tax/deductions');
        setDeductions(res.data.data);
      } catch (err) { console.error(err); }
    };

    const fetchQuarterly = async () => {
      try {
        const res = await api.get('/api/tax/quarterly');
        setQuarterly(res.data.data);
      } catch (err) { console.error(err); }
    };

    fetchDeductions();
    fetchQuarterly();
  }, []);

  const runAIStrategy = async () => {
    setLoadingStrategy(true);
    try {
      const res = await api.get('/api/tax/advice');
      setStrategy(res.data.data);
      setActiveTab('overview');
    } catch (err) { console.error(err); }
    finally { setLoadingStrategy(false); }
  };

  const runComplianceAudit = async () => {
    setLoadingAudit(true);
    try {
      const res = await api.get('/api/tax/compliance');
      setAudit(res.data.data);
      setActiveTab('compliance');
    } catch (err) { console.error(err); }
    finally { setLoadingAudit(false); }
  };

  const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'AI Strategy', icon: <Sparkles size={14} /> },
    { id: 'deductions', label: 'Deductions', icon: <FolderHeart size={14} /> },
    { id: 'quarterly', label: 'Quarterly', icon: <BarChart3 size={14} /> },
    { id: 'compliance', label: 'Compliance Audit', icon: <ShieldCheck size={14} /> },
  ];

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <PageHeader
          title="Tax & Compliance Center"
          description="AI-powered deduction tracking, quarterly summaries, and audit readiness."
        />
        <div className="flex gap-3">
          <button
            onClick={runComplianceAudit}
            disabled={loadingAudit}
            className="flex items-center gap-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 font-bold text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {loadingAudit ? <Clock className="animate-spin" size={15}/> : <ShieldCheck size={15}/>}
            Audit Now
          </button>
          <button
            onClick={runAIStrategy}
            disabled={loadingStrategy}
            className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 font-bold text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
          >
            {loadingStrategy ? <Bot className="animate-pulse" size={15}/> : <Sparkles size={15}/>}
            AI Tax Scan
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-vault-card border border-white/5 rounded-2xl p-5 shadow-xl">
          <div className="text-xs font-bold text-gray-500 uppercase mb-1">Claimed Deductions</div>
          <div className="text-2xl font-mono font-bold text-vault-green">${deductions?.totals?.claimed?.toFixed(2) ?? '0.00'}</div>
        </div>
        <div className="bg-vault-card border border-white/5 rounded-2xl p-5 shadow-xl">
          <div className="text-xs font-bold text-gray-500 uppercase mb-1">Potential Write-offs</div>
          <div className="text-2xl font-mono font-bold text-amber-400">${deductions?.totals?.potential?.toFixed(2) ?? '0.00'}</div>
        </div>
        <div className="bg-vault-card border border-white/5 rounded-2xl p-5 shadow-xl">
          <div className="text-xs font-bold text-gray-500 uppercase mb-1">Compliance Score</div>
          <div className={cn("text-2xl font-mono font-bold", (audit?.complianceScore ?? 100) >= 80 ? "text-vault-green" : "text-red-400")}>
            {audit?.complianceScore ?? '—'}{audit ? '/100' : ''}
          </div>
        </div>
        <div className="bg-vault-card border border-white/5 rounded-2xl p-5 shadow-xl">
          <div className="text-xs font-bold text-gray-500 uppercase mb-1">Audit Status</div>
          <div className={cn("text-lg font-bold capitalize", audit?.status === 'compliant' ? "text-vault-green" : audit?.status === 'at_risk' ? "text-amber-400" : "text-red-400")}>
            {audit?.status?.replace('_', ' ') ?? 'Not Run'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-white/10 pb-0">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-xl transition-colors border-b-2 -mb-px",
            activeTab === t.id ? "border-vault-green text-white bg-white/5" : "border-transparent text-gray-500 hover:text-white hover:bg-white/5"
          )}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {!strategy && (
            <div className="py-16 text-center border border-dashed border-indigo-500/20 rounded-2xl bg-indigo-500/5">
              <Sparkles size={48} className="mx-auto mb-4 text-indigo-400 opacity-50" />
              <p className="text-white font-bold mb-2">AI Tax Strategist Ready</p>
              <p className="text-gray-400 text-sm mb-6">Click &quot;AI Tax Scan&quot; to analyze your expenses, businesses, and investments for legal tax optimization opportunities.</p>
              <button onClick={runAIStrategy} disabled={loadingStrategy} className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30 font-bold px-6 py-2.5 rounded-xl transition-colors">
                {loadingStrategy ? 'Analyzing...' : 'Run AI Tax Scan'}
              </button>
            </div>
          )}
          {strategy && (
            <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Bot size={64} className="text-indigo-400"/></div>
              <h3 className="text-indigo-400 font-bold mb-2 flex items-center gap-2"><Bot size={18}/> AI Tax Strategy</h3>
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{strategy.strategy?.taxSummary || JSON.stringify(strategy.strategy, null, 2)}</p>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-indigo-500/20">
                <div><div className="text-xs text-gray-500 uppercase mb-1">Claimed</div><div className="font-mono font-bold text-vault-green">${strategy.metrics?.claimedDeductions?.toFixed(2)}</div></div>
                <div><div className="text-xs text-gray-500 uppercase mb-1">Potential</div><div className="font-mono font-bold text-amber-400">${strategy.metrics?.potentialDeductions?.toFixed(2)}</div></div>
                <div><div className="text-xs text-gray-500 uppercase mb-1">Businesses</div><div className="font-mono font-bold text-white">{strategy.metrics?.businessesCount}</div></div>
                <div><div className="text-xs text-gray-500 uppercase mb-1">Realized Gains</div><div className="font-mono font-bold text-blue-400">${strategy.metrics?.realizedGains?.toFixed(2)}</div></div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'deductions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><CheckCircle2 size={18} className="text-vault-green"/> Claimed Deductions ({deductions?.claimedDeductions?.length ?? 0})</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {(deductions?.claimedDeductions ?? []).map((exp: any) => (
                  <div key={exp.id} className="flex items-center justify-between bg-black/20 border border-white/5 rounded-xl px-4 py-2.5">
                    <div>
                      <div className="text-sm font-bold text-white">{exp.vendor || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{exp.taxCategory || 'General'}</div>
                    </div>
                    <div className="font-mono text-sm font-bold text-vault-green">${parseFloat(exp.amount).toFixed(2)}</div>
                  </div>
                ))}
                {(deductions?.claimedDeductions?.length ?? 0) === 0 && <p className="text-sm text-gray-600">No deductions claimed yet.</p>}
              </div>
            </div>

            <div className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-amber-400"/> Potential Write-offs ({deductions?.potentialDeductions?.length ?? 0})</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {(deductions?.potentialDeductions ?? []).map((exp: any) => (
                  <div key={exp.id} className="flex items-center justify-between bg-amber-900/10 border border-amber-500/20 rounded-xl px-4 py-2.5">
                    <div>
                      <div className="text-sm font-bold text-white">{exp.vendor || 'Unknown'}</div>
                      <div className="text-xs text-amber-400/70">Not yet claimed</div>
                    </div>
                    <div className="font-mono text-sm font-bold text-amber-400">${parseFloat(exp.amount).toFixed(2)}</div>
                  </div>
                ))}
                {(deductions?.potentialDeductions?.length ?? 0) === 0 && <p className="text-sm text-gray-600">No unclaimed deductions found.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quarterly' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(quarterly?.quarters ?? []).map((q: any) => (
            <div key={q.quarter} className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{q.quarter} <span className="text-gray-500">{q.year}</span></h3>
                <div className={cn("text-xs font-bold px-2 py-1 rounded uppercase", q.netIncome >= 0 ? "bg-vault-green/10 text-vault-green" : "bg-red-500/10 text-red-400")}>
                  {q.netIncome >= 0 ? 'Profitable' : 'At Loss'}
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Revenue', value: q.totalRevenue, color: 'text-vault-green' },
                  { label: 'Total Expenses', value: q.totalExpenses, color: 'text-red-400' },
                  { label: 'Tax Deductible', value: q.totalDeductible, color: 'text-indigo-400' },
                  { label: 'Net Income', value: q.netIncome, color: q.netIncome >= 0 ? 'text-white' : 'text-red-400' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                    <span className="text-gray-400">{item.label}</span>
                    <span className={cn("font-mono font-bold", item.color)}>${Math.abs(item.value).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex gap-4 pt-1 text-xs text-gray-500">
                  <span>{q.expenseCount} expenses</span>
                  <span>{q.invoiceCount} invoices</span>
                  <span>{q.deductibleCount} deductions</span>
                </div>
              </div>
            </div>
          ))}
          {(quarterly?.quarters?.length ?? 0) === 0 && (
            <div className="col-span-2 py-12 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl">No quarterly data available yet.</div>
          )}
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-6">
          {!audit ? (
            <div className="py-16 text-center border border-dashed border-amber-500/20 rounded-2xl bg-amber-500/5">
              <ShieldCheck size={48} className="mx-auto mb-4 text-amber-400 opacity-50" />
              <p className="text-white font-bold mb-2">Compliance Audit Engine</p>
              <p className="text-gray-400 text-sm mb-6">Scan your records for missing receipts, uncategorized deductions, and compliance gaps.</p>
              <button onClick={runComplianceAudit} disabled={loadingAudit} className="bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 font-bold px-6 py-2.5 rounded-xl transition-colors">
                {loadingAudit ? 'Auditing...' : 'Run Compliance Audit'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-white text-lg">Audit Results</h3>
                  <div className={cn("text-3xl font-mono font-bold", audit.complianceScore >= 80 ? 'text-vault-green' : audit.complianceScore >= 50 ? 'text-amber-400' : 'text-red-400')}>
                    {audit.complianceScore}<span className="text-sm font-normal text-gray-500">/100</span>
                  </div>
                </div>

                {audit.issues.length === 0 && audit.warnings.length === 0 && (
                  <div className="flex items-center gap-3 text-vault-green bg-vault-green/10 border border-vault-green/20 rounded-xl p-4">
                    <CheckCircle2 size={20} /> <span className="font-bold">All records are compliant. No issues detected.</span>
                  </div>
                )}

                {audit.issues.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-red-400 uppercase mb-3 flex items-center gap-2"><XCircle size={14}/> Issues Requiring Immediate Action</h4>
                    <div className="space-y-3">
                      {audit.issues.map((issue: any, i: number) => (
                        <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                          <p className="text-sm text-red-300 font-bold mb-0.5">{issue.type.replace(/_/g, ' ').toUpperCase()}</p>
                          <p className="text-xs text-red-200/70">{issue.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {audit.warnings.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase mb-3 flex items-center gap-2"><AlertTriangle size={14}/> Warnings</h4>
                    <div className="space-y-3">
                      {audit.warnings.map((warn: any, i: number) => (
                        <div key={i} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                          <p className="text-xs text-amber-200/80">{warn.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils/cn';
import {
  Zap, PlayCircle, FileText, Repeat, AlertTriangle, 
  Scale, TrendingDown, CheckCircle, Clock, Activity,
  ShieldCheck, Receipt, Bot
} from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  invoices: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  billing: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  expenses: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  tax: 'text-vault-green bg-vault-green/10 border-vault-green/20',
  advisor: 'text-red-400 bg-red-500/10 border-red-500/20'
};

const CATEGORY_LABELS: Record<string, string> = {
  invoices: 'Invoices',
  billing: 'Billing',
  expenses: 'Expenses',
  tax: 'Tax',
  advisor: 'AI Advisor'
};

const ICON_MAP: Record<string, React.ReactNode> = {
  FileText: <FileText size={20} />,
  CheckCircle: <CheckCircle size={20} />,
  Repeat: <Repeat size={20} />,
  AlertTriangle: <AlertTriangle size={20} />,
  ShieldAlert: <ShieldCheck size={20} />,
  Scale: <Scale size={20} />,
  TrendingDown: <TrendingDown size={20} />
};

type FilterCategory = 'all' | 'invoices' | 'billing' | 'expenses' | 'tax' | 'advisor';

export default function FinancialAutomationPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [lastLog, setLastLog] = useState<any>(null);
  const [filter, setFilter] = useState<FilterCategory>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wfRes, statsRes] = await Promise.all([
          api.get('/automation/financial/workflows'),
          api.get('/automation/financial/stats')
        ]);
        setWorkflows(wfRes.data.data);
        setStats(statsRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTrigger = async (workflowId: string) => {
    setTriggering(workflowId);
    try {
      const res = await api.post(`/automation/financial/workflows/${workflowId}/trigger`);
      setLastLog(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTriggering(null);
    }
  };

  const filtered = filter === 'all' ? workflows : workflows.filter(w => w.category === filter);
  const FILTERS: FilterCategory[] = ['all', 'invoices', 'billing', 'expenses', 'tax', 'advisor'];

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <PageHeader
          title="Financial Automation"
          description="AI-connected workflows for recurring payments, approvals, alerts, and tax reminders."
        />
        <div className="flex items-center gap-2 bg-vault-green/10 border border-vault-green/20 text-vault-green text-xs font-bold px-4 py-2 rounded-xl">
          <Activity size={14} className="animate-pulse" /> Engine Active
        </div>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Workflows', value: stats.totalWorkflows, color: 'text-white' },
            { label: 'Active Rules', value: stats.activeWorkflows, color: 'text-vault-green' },
            { label: 'Pending Alerts', value: stats.pendingAlerts, color: 'text-amber-400' },
            { label: 'Active Subscriptions', value: stats.activeSubscriptions, color: 'text-indigo-400' },
            { label: 'Total Expenses', value: stats.expenseCount, color: 'text-white' },
            { label: 'Tax Deductions', value: stats.taxDeductions, color: 'text-vault-green' }
          ].map(item => (
            <div key={item.label} className="bg-vault-card border border-white/5 rounded-2xl p-4 shadow-xl">
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">{item.label}</div>
              <div className={cn("text-2xl font-mono font-bold", item.color)}>{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Last Execution Log */}
      {lastLog && (
        <div className="bg-vault-green/10 border border-vault-green/20 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <CheckCircle size={20} className="text-vault-green mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-vault-green font-bold text-sm">{lastLog.workflowName}</p>
            <p className="text-vault-green/70 text-xs mt-0.5">{lastLog.message}</p>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {FILTERS.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors capitalize",
              filter === cat
                ? "bg-white/10 text-white border-white/20"
                : "bg-transparent text-gray-500 border-white/5 hover:text-white hover:border-white/20"
            )}
          >
            {cat === 'all' ? 'All Workflows' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Workflow Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map(wf => {
          const colorClass = CATEGORY_COLORS[wf.category] || 'text-gray-400 bg-white/5 border-white/10';
          const isTriggering = triggering === wf.id;

          return (
            <div key={wf.id} className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-white/10 transition-all">
              {/* Priority indicator */}
              {wf.priority === 'high' && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className={cn("p-3 rounded-xl border flex-shrink-0", colorClass)}>
                  {ICON_MAP[wf.icon] || <Zap size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-white text-base">{wf.name}</h3>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded uppercase border", colorClass)}>
                      {CATEGORY_LABELS[wf.category]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1 leading-relaxed">{wf.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <div className="text-xs text-gray-500">
                  <span className="text-gray-400 font-bold">{wf.contextNote}</span>
                  {wf.triggerCount > 0 && (
                    <span className="ml-2 text-amber-400 font-bold">· {wf.triggerCount} pending</span>
                  )}
                </div>
                <button
                  onClick={() => handleTrigger(wf.id)}
                  disabled={isTriggering}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors",
                    wf.priority === 'high'
                      ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20"
                      : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                  )}
                >
                  {isTriggering ? (
                    <><Clock size={12} className="animate-spin" /> Running...</>
                  ) : (
                    <><PlayCircle size={12} /> Run Now</>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && !loading && (
          <div className="col-span-2 py-16 text-center border border-dashed border-white/10 rounded-2xl">
            <Bot size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-gray-500 font-bold">No workflows in this category.</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

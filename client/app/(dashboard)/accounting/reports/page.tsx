'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { FileBarChart, PieChart, TrendingUp, Download, FileText, Bot, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function FinancialReportsPage() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pnl' | 'balance' | 'cashflow'>('pnl');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/api/financial/accounting/reports');
        setReports(res.data.data.reports);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleExport = (format: 'csv' | 'pdf' | 'xlsx') => {
    // Generate the URL for the native browser download
    const exportType = activeTab === 'balance' ? 'balanceSheet' : 'pnl';
    const url = `/api/financial/accounting/reports/export?type=${exportType}&format=${format}`;
    window.open(url, '_blank');
  };

  if (loading) return <PageContainer><div className="text-gray-500 animate-pulse">Loading reports...</div></PageContainer>;
  if (!reports) return null;

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <PageHeader 
          title="Enterprise Financial Reports" 
          description="Real-time P&L, Balance Sheet, and AI-driven Cash Flow metrics." 
        />
        
        {/* Export Actions */}
        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-1">
          <button onClick={() => handleExport('csv')} className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1">
            <Download size={14} /> CSV
          </button>
          <button onClick={() => handleExport('pdf')} className="px-3 py-1.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1">
            <FileText size={14} /> PDF
          </button>
          <button onClick={() => handleExport('xlsx')} className="px-3 py-1.5 text-xs font-bold text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors flex items-center gap-1">
            <FileBarChart size={14} /> XLSX
          </button>
        </div>
      </div>

      {/* AI Executive Summary Ribbon */}
      {reports.aiSummary && (
        <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Bot size={64} className="text-indigo-400"/></div>
          <h3 className="text-indigo-400 font-bold text-sm mb-2 flex items-center gap-2">
            <Bot size={16}/> AI Executive Summary
          </h3>
          <p className="text-white text-sm leading-relaxed max-w-4xl whitespace-pre-wrap">
            {reports.aiSummary.text}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-400">
            <ShieldCheck size={14} className={reports.aiSummary.healthScore >= 90 ? "text-vault-green" : "text-amber-400"} />
            System Health Score: {reports.aiSummary.healthScore}/100
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-8 mt-4 border-b border-white/10 pb-4">
        <button onClick={() => setActiveTab('pnl')} className={cn("px-4 py-2 font-bold text-sm rounded-lg transition-colors", activeTab === 'pnl' ? "bg-white/10 text-white" : "text-gray-500 hover:text-white")}>
          Profit & Loss
        </button>
        <button onClick={() => setActiveTab('balance')} className={cn("px-4 py-2 font-bold text-sm rounded-lg transition-colors", activeTab === 'balance' ? "bg-white/10 text-white" : "text-gray-500 hover:text-white")}>
          Balance Sheet
        </button>
        <button onClick={() => setActiveTab('cashflow')} className={cn("px-4 py-2 font-bold text-sm rounded-lg transition-colors", activeTab === 'cashflow' ? "bg-white/10 text-white" : "text-gray-500 hover:text-white")}>
          Cash Flow
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2">
          {activeTab === 'pnl' && (
            <div className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2"><PieChart size={18} className="text-vault-green"/> Income vs Expenses</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-vault-green mb-3 uppercase border-b border-white/5 pb-2">Income Categories</h4>
                  {Object.entries(reports.pnl.breakdown.income).map(([cat, amt]) => (
                    <div key={cat} className="flex justify-between text-sm py-1">
                      <span className="text-gray-400 capitalize">{cat}</span>
                      <span className="text-white font-mono">${(amt as number).toFixed(2)}</span>
                    </div>
                  ))}
                  {Object.keys(reports.pnl.breakdown.income).length === 0 && <div className="text-sm text-gray-600">No income recorded.</div>}
                  <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-white/5">
                    <span className="text-white">Total Income</span>
                    <span className="text-vault-green font-mono">${reports.pnl.totalIncome.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-red-400 mb-3 uppercase border-b border-white/5 pb-2">Expense Categories</h4>
                  {Object.entries(reports.pnl.breakdown.expenses).map(([cat, amt]) => (
                    <div key={cat} className="flex justify-between text-sm py-1">
                      <span className="text-gray-400 capitalize">{cat}</span>
                      <span className="text-white font-mono">${(amt as number).toFixed(2)}</span>
                    </div>
                  ))}
                  {Object.keys(reports.pnl.breakdown.expenses).length === 0 && <div className="text-sm text-gray-600">No expenses recorded.</div>}
                  <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-white/5">
                    <span className="text-white">Total Expenses</span>
                    <span className="text-red-400 font-mono">${reports.pnl.totalExpenses.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'balance' && (
            <div className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2"><FileBarChart size={18} className="text-indigo-400"/> Statement of Financial Position</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-blue-400 mb-3 uppercase border-b border-white/5 pb-2">Assets (Wallets)</h4>
                  {reports.balanceSheet.assets.accounts.map((acc: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span className="text-gray-400">{acc.name}</span>
                      <span className="text-white font-mono">${acc.balance.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-white/5">
                    <span className="text-white">Total Assets</span>
                    <span className="text-blue-400 font-mono">${reports.balanceSheet.assets.total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm font-bold pt-4">
                  <span className="text-white">Total Liabilities & Equity</span>
                  <span className="text-white font-mono">${(reports.balanceSheet.liabilities.total + reports.balanceSheet.equity.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cashflow' && (
            <div className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl text-center py-20 text-gray-400">
              <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold">Operating Cash Flow: <span className={reports.cashFlow.netCashFlow >= 0 ? 'text-vault-green' : 'text-red-400'}>${reports.cashFlow.netCashFlow.toFixed(2)}</span></p>
              <p className="text-sm mt-2">Investing & Financing flow logic mapping in progress.</p>
            </div>
          )}
        </div>

        {/* Sidebar KPIs */}
        <div className="space-y-6">
          <div className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Net Income (P&L)</h3>
            <div className={cn("text-4xl font-display font-bold", reports.pnl.netIncome >= 0 ? "text-vault-green" : "text-red-400")}>
              ${Math.abs(reports.pnl.netIncome).toFixed(2)}
            </div>
          </div>
          <div className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Total Equity</h3>
            <div className="text-4xl font-display font-bold text-blue-400">
              ${reports.balanceSheet.equity.total.toFixed(2)}
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { 
  ArrowRightLeft, Search, Bot, AlertTriangle, 
  Repeat, Tag, Filter, CheckCircle2, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [filters, setFilters] = useState({ search: '', category: '' });

  const fetchTransactions = React.useCallback(async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await api.get(`/financial/transactions?${query}`);
      setTransactions(res.data.data.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const runAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await api.get('/financial/transactions/ai-insights');
      setInsights(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const updateCategory = async (id: string, newCategory: string) => {
    try {
      await api.patch(`/financial/transactions/${id}/category`, { category: newCategory });
      await fetchTransactions(); // Refresh
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]); // Refetch on filter change

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <PageHeader 
          title="Transactions" 
          description="Enterprise intelligent ledger with AI anomaly detection." 
        />
        <button 
          onClick={runAIAnalysis}
          disabled={analyzing}
          className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 font-bold text-sm px-4 py-2 rounded-xl transition-colors shadow-[0_0_15px_rgba(99,102,241,0.2)] disabled:opacity-50"
        >
          {analyzing ? <RefreshCw className="animate-spin" size={16} /> : <Bot size={16} />} 
          Run AI Scan
        </button>
      </div>

      {/* AI Insights Ribbon */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-vault-card border border-amber-500/20 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle size={64}/></div>
            <h3 className="text-amber-400 font-bold text-sm mb-2 flex items-center gap-2"><AlertTriangle size={16}/> Anomalies Detected</h3>
            <div className="text-2xl font-bold text-white mb-1">{insights.anomalies.length}</div>
            <p className="text-xs text-gray-400 line-clamp-1">{insights.anomalies[0]?.reason || 'No significant outliers found.'}</p>
          </div>
          
          <div className="bg-vault-card border border-blue-500/20 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Repeat size={64}/></div>
            <h3 className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2"><Repeat size={16}/> Potential Duplicates</h3>
            <div className="text-2xl font-bold text-white mb-1">{insights.duplicates.length}</div>
            <p className="text-xs text-gray-400">Transactions with identical matching hashes.</p>
          </div>

          <div className="bg-vault-card border border-vault-green/20 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle2 size={64}/></div>
            <h3 className="text-vault-green font-bold text-sm mb-2 flex items-center gap-2"><Tag size={16}/> Recurring Patterns</h3>
            <div className="text-2xl font-bold text-white mb-1">{insights.recurring.length}</div>
            <p className="text-xs text-gray-400">Subscriptions / expected future outflows.</p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Search merchant or description..." 
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-vault-green outline-none transition-colors"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Filter Category..." 
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-vault-green outline-none transition-colors"
          />
        </div>
      </div>

      {/* Transaction Data Table */}
      <div className="bg-vault-card border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Source Wallet</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <ArrowRightLeft size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">No transactions found matching your criteria.</p>
                  </td>
                </tr>
              )}
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-sm text-white">{tx.merchant || 'Unknown Merchant'}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{tx.description}</div>
                    {tx.invoiceId && <span className="inline-block mt-1 text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">Invoice Linked</span>}
                  </td>
                  <td className="p-4">
                    <input 
                      type="text"
                      defaultValue={tx.category || ''}
                      onBlur={(e) => updateCategory(tx.id, e.target.value)}
                      placeholder="Uncategorized"
                      className="bg-transparent border border-transparent hover:border-white/20 focus:border-vault-green focus:bg-black/40 rounded px-2 py-1 text-sm text-gray-300 outline-none transition-all w-32"
                    />
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {tx.wallet?.name || 'Main Wallet'}
                  </td>
                  <td className="p-4 text-right">
                    <div className={cn(
                      "font-mono font-bold whitespace-nowrap",
                      tx.type === 'income' ? 'text-vault-green' : 'text-white'
                    )}>
                      {tx.type === 'income' ? '+' : '-'}${Math.abs(parseFloat(tx.amount)).toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}

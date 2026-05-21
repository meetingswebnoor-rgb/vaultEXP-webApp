'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { 
  Receipt, Bot, AlertTriangle, FileCheck, 
  PiggyBank, UploadCloud, FileText, CheckCircle2 
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: 0,
    vendor: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isTaxDeductible: false,
    taxCategory: 'Operating Expense'
  });

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/api/financial/expenses');
      setExpenses(res.data.data.expenses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const runAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await api.get('/api/financial/expenses/ai-insights');
      setInsights(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate file upload receiptUrl creation for MVP
      const mockReceiptUrl = `https://vault-storage.mock/receipts/doc-${Date.now()}.pdf`;
      await api.post('/api/financial/expenses', { ...formData, receiptUrl: mockReceiptUrl });
      setShowModal(false);
      await fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTaxStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/api/financial/expenses/${id}/tax-status`, { isTaxDeductible: !currentStatus });
      await fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <PageHeader 
          title="Intelligent Expenses" 
          description="Track spending, store receipts, and maximize tax deductions via AI." 
        />
        <div className="flex gap-4">
          <button 
            onClick={runAIAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 font-bold text-sm px-4 py-2 rounded-xl transition-colors shadow-[0_0_15px_rgba(99,102,241,0.2)] disabled:opacity-50"
          >
            {analyzing ? <Bot className="animate-pulse" size={16} /> : <Bot size={16} />} 
            Run AI Scan
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-vault-green text-black hover:bg-vault-green/90 font-bold text-sm px-4 py-2 rounded-xl transition-colors shadow-[0_0_15px_rgba(0,255,136,0.3)]"
          >
            <UploadCloud size={16} /> Log Expense
          </button>
        </div>
      </div>

      {/* AI Insights Ribbon */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-900/40 to-black border border-vault-green/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><PiggyBank size={64} className="text-vault-green"/></div>
            <h3 className="text-vault-green font-bold text-sm mb-2 flex items-center gap-2"><PiggyBank size={16}/> Savings Opportunities</h3>
            <div className="text-2xl font-bold text-white mb-1">{insights.savings.length}</div>
            <p className="text-xs text-gray-400 line-clamp-1">{insights.savings[0]?.reason || 'Your spending is highly optimized.'}</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-900/40 to-black border border-blue-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><FileCheck size={64} className="text-blue-400"/></div>
            <h3 className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2"><FileCheck size={16}/> Missed Tax Write-offs</h3>
            <div className="text-2xl font-bold text-white mb-1">{insights.taxWriteOffs.length}</div>
            <p className="text-xs text-gray-400">Potential deductions missing from your tax ledger.</p>
          </div>

          <div className="bg-gradient-to-br from-amber-900/40 to-black border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle size={64} className="text-amber-400"/></div>
            <h3 className="text-amber-400 font-bold text-sm mb-2 flex items-center gap-2"><AlertTriangle size={16}/> Anomalies / Duplicates</h3>
            <div className="text-2xl font-bold text-white mb-1">{insights.anomalies.length + insights.duplicates.length}</div>
            <p className="text-xs text-gray-400">Unusually high spend or double-billing detected.</p>
          </div>
        </div>
      )}

      {/* Expense Datatable */}
      <div className="bg-vault-card border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vendor / Detail</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Receipt</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Tax Deductible</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {expenses.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <Receipt size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">No expenses logged yet.</p>
                  </td>
                </tr>
              )}
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(exp.date).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-sm text-white">{exp.vendor || 'Unknown Vendor'}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{exp.description}</div>
                  </td>
                  <td className="p-4 text-center">
                    {exp.receiptUrl ? (
                      <a href={exp.receiptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-1 rounded">
                        <FileText size={14} /> View
                      </a>
                    ) : (
                      <span className="text-xs text-gray-600">None</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => toggleTaxStatus(exp.id, exp.isTaxDeductible)}
                      className={cn(
                        "inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors",
                        exp.isTaxDeductible ? "bg-vault-green/20 text-vault-green" : "bg-white/5 text-gray-500 hover:bg-white/10"
                      )}
                    >
                      {exp.isTaxDeductible ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-gray-500"></div>}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-mono font-bold text-white whitespace-nowrap">
                      ${parseFloat(exp.amount).toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateExpense} className="bg-vault-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <UploadCloud className="text-vault-green" /> Log Expense
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Vendor</label>
                  <input required type="text" value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})} placeholder="e.g. Amazon" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-vault-green outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Amount</label>
                  <input required type="number" step="0.01" min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-vault-green outline-none text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-vault-green outline-none text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Date</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-vault-green outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Receipt Upload</label>
                  <div className="w-full bg-black/40 border border-dashed border-white/20 rounded-xl px-4 py-2 text-center text-sm text-gray-500 cursor-pointer hover:border-vault-green hover:text-vault-green transition-colors">
                    Click to attach file
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <label className="text-sm font-bold text-white flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isTaxDeductible} onChange={e => setFormData({...formData, isTaxDeductible: e.target.checked})} className="accent-vault-green w-4 h-4" />
                  Mark as Tax Deductible
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 rounded-xl transition-colors">Cancel</button>
              <button type="submit" className="flex-1 bg-vault-green hover:bg-vault-green/90 text-black font-bold py-2.5 rounded-xl transition-colors shadow-[0_0_15px_rgba(0,255,136,0.2)]">Save Expense</button>
            </div>
          </form>
        </div>
      )}
    </PageContainer>
  );
}

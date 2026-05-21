'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { BookOpen, Plus, Trash2, Save, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function AccountingJournalPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ description: '', date: '' });
  const [lines, setLines] = useState([
    { walletId: '', debit: 0, credit: 0 },
    { walletId: '', debit: 0, credit: 0 }
  ]);

  const fetchWallets = async () => {
    try {
      const res = await api.get('/wallet');
      setWallets(res.data.data.wallets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const totalDebits = lines.reduce((acc, line) => acc + (parseFloat(line.debit as any) || 0), 0);
  const totalCredits = lines.reduce((acc, line) => acc + (parseFloat(line.credit as any) || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.001;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return alert("Journal entry must balance.");
    
    try {
      await api.post('/financial/accounting/journal', {
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        lines
      });
      alert('Journal entry successfully recorded.');
      setFormData({ description: '', date: '' });
      setLines([{ walletId: '', debit: 0, credit: 0 }, { walletId: '', debit: 0, credit: 0 }]);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Journal Entries" 
        description="Create compliant double-entry ledger adjustments." 
      />

      <form onSubmit={handleSubmit} className="mt-8 bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6 text-white font-bold text-lg">
          <BookOpen className="text-indigo-400" /> New Manual Journal
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description / Memo</label>
            <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-vault-green outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Date</label>
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-vault-green outline-none" />
          </div>
        </div>

        <div className="border border-white/5 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/20 border-b border-white/5">
                <th className="p-3 text-xs font-bold text-gray-500 uppercase">Account (Wallet)</th>
                <th className="p-3 text-xs font-bold text-gray-500 uppercase w-32">Debit</th>
                <th className="p-3 text-xs font-bold text-gray-500 uppercase w-32">Credit</th>
                <th className="p-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lines.map((line, idx) => (
                <tr key={idx} className="bg-black/10">
                  <td className="p-3">
                    <select required value={line.walletId} onChange={e => { const newL = [...lines]; newL[idx].walletId = e.target.value; setLines(newL); }} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-vault-green outline-none">
                      <option value="">Select Account...</option>
                      {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({w.currency})</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <input type="number" min="0" step="0.01" value={line.debit} onChange={e => { const newL = [...lines]; newL[idx].debit = parseFloat(e.target.value) || 0; newL[idx].credit = 0; setLines(newL); }} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-vault-green outline-none text-right" />
                  </td>
                  <td className="p-3">
                    <input type="number" min="0" step="0.01" value={line.credit} onChange={e => { const newL = [...lines]; newL[idx].credit = parseFloat(e.target.value) || 0; newL[idx].debit = 0; setLines(newL); }} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-vault-green outline-none text-right" />
                  </td>
                  <td className="p-3 text-right">
                    <button type="button" onClick={() => { if(lines.length>2) setLines(lines.filter((_,i)=>i!==idx))}} className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 bg-black/40 border-t border-white/5 flex items-center justify-between">
            <button type="button" onClick={() => setLines([...lines, { walletId: '', debit: 0, credit: 0 }])} className="text-xs font-bold text-vault-green flex items-center gap-1 hover:underline">
              <Plus size={14} /> Add Line
            </button>
            <div className="flex gap-8 font-mono text-sm font-bold pr-16">
              <span className={cn(isBalanced ? 'text-white' : 'text-amber-400')}>{totalDebits.toFixed(2)}</span>
              <span className={cn(isBalanced ? 'text-white' : 'text-amber-400')}>{totalCredits.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold">
            {isBalanced ? (
              <span className="text-vault-green flex items-center gap-1"><CheckCircle size={16} /> Balanced</span>
            ) : (
              <span className="text-amber-400">Out of balance by {Math.abs(totalDebits - totalCredits).toFixed(2)}</span>
            )}
          </div>
          <button 
            type="submit" 
            disabled={!isBalanced || lines.some(l => !l.walletId)}
            className="flex items-center gap-2 bg-vault-green text-black font-bold py-2.5 px-6 rounded-xl hover:bg-vault-green/90 transition-colors disabled:opacity-50"
          >
            <Save size={16} /> Record Entry
          </button>
        </div>
      </form>
    </PageContainer>
  );
}

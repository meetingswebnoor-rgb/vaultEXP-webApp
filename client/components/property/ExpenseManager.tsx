'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit3, Trash2, Receipt, Search } from 'lucide-react';
import { expenseApi, PropertyExpense } from '@/features/property/expenseApi';
import { ExpenseModal } from './ExpenseModal';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';

const CAT_COLORS: Record<string, string> = {
  maintenance: '#F59E0B', repair: '#EF4444', tax: '#8B5CF6',
  insurance: '#3B82F6', mortgage: '#EC4899', utilities: '#06B6D4',
  management_fee: '#10B981', renovation: '#F97316', other: '#6B7280',
};

function fmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toLocaleString()}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ExpenseManager({ propertyId }: { propertyId: string }) {
  const qc = useQueryClient();
  const { isDesktop } = useBreakpoint();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<PropertyExpense | undefined>();
  const [search, setSearch] = useState('');

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', propertyId],
    queryFn: () => expenseApi.list(propertyId),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => expenseApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['property', propertyId] });
      qc.invalidateQueries({ queryKey: ['expenses', propertyId] });
    },
  });

  const filtered = expenses.filter(e => 
    e.category.toLowerCase().includes(search.toLowerCase()) || 
    (e.note || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.vendor || '').toLowerCase().includes(search.toLowerCase())
  );

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const handleEdit = (e: PropertyExpense) => {
    setEditingExpense(e);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingExpense(undefined);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-vault-green/20 border-t-vault-green rounded-full animate-spin" /></div>;
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 border border-dashed border-white/[0.07] rounded-2xl">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
          <Receipt size={22} className="text-gray-600" strokeWidth={1.5} />
        </div>
        <p className="text-[13px] text-gray-500">No expenses recorded</p>
        <button onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-vault-green/10 border border-vault-green/20 text-vault-green text-[12px] font-semibold hover:bg-vault-green/20 transition-colors">
          <Plus size={13} /> Add Expense
        </button>
        <ExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} propertyId={propertyId} expense={editingExpense} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Toolbar ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" placeholder="Search expenses..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-[13px] text-white focus:border-red-400/50 outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Total Filtered</p>
            <p className="text-[16px] font-bold font-display text-red-400">-{fmt(total)}</p>
          </div>
          <button onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] text-white text-[12px] font-semibold transition-all">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* ── Desktop Table ──────────────────────────────────────── */}
      {isDesktop ? (
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.04] border-b border-white/[0.06]">
                {['Date', 'Category', 'Note / Vendor', 'Amount', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map(e => {
                const catColor = CAT_COLORS[e.category] ?? '#6B7280';
                return (
                  <tr key={e._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4 text-[12px] text-gray-400 whitespace-nowrap">{fmtDate(e.date)}</td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full capitalize"
                        style={{ backgroundColor: `${catColor}18`, color: catColor }}>
                        {e.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-gray-300 max-w-[200px] truncate">
                      {e.note || e.vendor || '—'}
                    </td>
                    <td className="px-5 py-4 text-[14px] font-bold text-red-400">-{fmt(e.amount)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(e)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-gray-400 hover:text-white transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => deleteMut.mutate(e._id)} disabled={deleteMut.isPending} className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── Mobile Cards ────────────────────────────────────────── */
        <div className="space-y-3">
          {filtered.map((e, idx) => {
            const catColor = CAT_COLORS[e.category] ?? '#6B7280';
            return (
              <motion.div
                key={e._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full capitalize"
                    style={{ backgroundColor: `${catColor}18`, color: catColor }}>
                    {e.category.replace(/_/g, ' ')}
                  </span>
                  <p className="text-[14px] font-bold text-red-400">-{fmt(e.amount)}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-[13px] text-white font-medium">{e.vendor || 'Expense'}</p>
                  <p className="text-[12px] text-gray-400 truncate">{e.note || 'No notes'}</p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/[0.05]">
                  <p className="text-[11px] text-gray-500">{fmtDate(e.date)}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(e)} className="p-2 rounded-xl bg-white/[0.05] text-gray-400 hover:text-white transition-colors">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => deleteMut.mutate(e._id)} disabled={deleteMut.isPending} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <ExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} propertyId={propertyId} expense={editingExpense} />
    </div>
  );
}

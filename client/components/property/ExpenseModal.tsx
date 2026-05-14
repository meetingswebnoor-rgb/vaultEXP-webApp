'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Calendar, FileText, Briefcase, CreditCard } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi, ExpenseFormData, PropertyExpense } from '@/features/property/expenseApi';
import { GlobalModal } from '@/components/ui/GlobalModal';

const CATEGORIES = [
  'maintenance', 'repair', 'tax', 'insurance', 'mortgage', 
  'utilities', 'management_fee', 'renovation', 'other'
];

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  expense?: PropertyExpense; // If passed, we are editing
}

export function ExpenseModal({ isOpen, onClose, propertyId, expense }: ExpenseModalProps) {
  const qc = useQueryClient();
  const [formData, setFormData] = useState<Omit<ExpenseFormData, 'amount'> & { amount: string | number }>({
    amount: '',
    category: 'maintenance',
    date: new Date().toISOString().split('T')[0],
    note: '',
    vendor: '',
    paymentMethod: 'bank_transfer',
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount,
        category: expense.category,
        date: new Date(expense.date).toISOString().split('T')[0],
        note: expense.note ?? '',
        vendor: expense.vendor ?? '',
        paymentMethod: expense.paymentMethod ?? 'bank_transfer',
      });
    } else {
      setFormData({
        amount: '',
        category: 'maintenance',
        date: new Date().toISOString().split('T')[0],
        note: '',
        vendor: '',
        paymentMethod: 'bank_transfer',
      });
    }
  }, [expense, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: ExpenseFormData) => 
      expense ? expenseApi.update(expense._id, data) : expenseApi.create(propertyId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['property', propertyId] });
      qc.invalidateQueries({ queryKey: ['expenses', propertyId] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      amount: Number(formData.amount),
    });
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={expense ? 'Edit Expense' : 'Add Expense'}
      description={expense ? 'Update transaction details.' : 'Record a property-related cost.'}
      icon={<DollarSign size={22} />}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Amount & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Amount</label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="number" required min="0" step="0.01"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-[14px] text-white focus:border-vault-green/50 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-white focus:border-vault-green/50 outline-none transition-all appearance-none capitalize"
            >
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-vault-dark">{c.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        {/* Date & Method */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="date" required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-[14px] text-white focus:border-vault-green/50 outline-none transition-all [color-scheme:dark]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Method</label>
            <div className="relative">
              <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <select
                value={formData.paymentMethod}
                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-[14px] text-white focus:border-vault-green/50 outline-none transition-all appearance-none"
              >
                <option value="bank_transfer" className="bg-vault-dark">Bank Transfer</option>
                <option value="card" className="bg-vault-dark">Card</option>
                <option value="cash" className="bg-vault-dark">Cash</option>
                <option value="crypto" className="bg-vault-dark">Crypto</option>
                <option value="other" className="bg-vault-dark">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vendor */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Vendor (Optional)</label>
          <div className="relative">
            <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={formData.vendor}
              onChange={e => setFormData({ ...formData, vendor: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-[14px] text-white focus:border-vault-green/50 outline-none transition-all"
              placeholder="e.g. Home Depot"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Note (Optional)</label>
          <div className="relative">
            <FileText size={16} className="absolute left-3 top-4 text-gray-500" />
            <textarea
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-[14px] text-white focus:border-vault-green/50 outline-none transition-all min-h-[80px]"
              placeholder="Details..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-red-500 text-white font-bold text-[14px] py-3.5 rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-400 transition-all disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : expense ? 'Update Expense' : 'Add Expense'}
        </button>
      </form>
    </GlobalModal>
  );
}

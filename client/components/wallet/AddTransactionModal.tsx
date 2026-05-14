'use client';

import { useState } from 'react';
import { X, Loader2, ArrowRightLeft, DollarSign, Calendar, FileText, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';
import { GlobalModal } from '@/components/ui/GlobalModal';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: any[];
}

export function AddTransactionModal({ isOpen, onClose, wallets }: AddTransactionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    walletId: wallets[0]?._id || '',
    type: 'expense',
    amount: '',
    category: 'General',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.walletId) {
      setError('Please select a wallet first.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await api.post(`/api/wallet/${formData.walletId}/transactions`, {
        type: formData.type,
        amount: Number(formData.amount),
        category: formData.category,
        note: formData.note,
        date: formData.date
      });

      await queryClient.invalidateQueries({ queryKey: ['wallets'] });
      await queryClient.invalidateQueries({ queryKey: ['wallet'] });
      await queryClient.invalidateQueries({ queryKey: ['wallet-analytics'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      showToast('Transaction added successfully', 'success');
      setFormData({
        walletId: wallets[0]?._id || '',
        type: 'expense',
        amount: '',
        category: 'General',
        note: '',
        date: new Date().toISOString().split('T')[0]
      });
      onClose();
    } catch (err: any) {
      console.error('[AddTransactionModal] Error:', err);
      setError(err.response?.data?.message || 'Failed to add transaction.');
      showToast('Failed to add transaction', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Transaction"
      description="Record income or expenses."
      icon={<ArrowRightLeft size={22} />}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="p-7 space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Select Wallet</label>
          <select
            value={formData.walletId}
            onChange={(e) => setFormData({ ...formData, walletId: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-blue-500/50"
          >
            <option value="">Choose an account...</option>
            {wallets.map(w => (
              <option key={w._id} value={w._id}>{w.accountName} ({w.bankName})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Type</label>
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.type === 'income' ? 'bg-vault-green text-black' : 'text-gray-500'}`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.type === 'expense' ? 'bg-red-500 text-white' : 'text-gray-500'}`}
              >
                Expense
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input
                type="number" required step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-blue-500/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Note</label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            rows={2}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-blue-500/50 resize-none"
          />
        </div>

        <div className="pt-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            type="submit"
            className="w-full py-4 bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-400 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
            {isLoading ? 'Saving...' : 'Record Transaction'}
          </motion.button>
        </div>
      </form>
    </GlobalModal>
  );
}

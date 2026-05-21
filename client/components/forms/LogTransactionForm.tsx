'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Receipt, Wallet, ArrowRightLeft, DollarSign, Calendar, ChevronRight, Loader2, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useActionStore } from '@/store/actionStore';
import { cn } from '@/lib/utils/cn';

const transactionSchema = z.object({
  walletId: z.string().min(1, 'Please select a wallet'),
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.string().min(1, 'Amount is required').transform(v => parseFloat(v)),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export function LogTransactionForm() {
  const { closeAction } = useActionStore();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await api.get('/api/wallet');
        setWallets(res.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch wallets', err);
      }
    };
    fetchWallets();
  }, []);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await api.post('/api/wallet/transaction', data);
      showToast('Transaction logged successfully', 'success');
      closeAction();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to log transaction', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-6">
      {/* Wallet Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
          <Wallet size={12} className="text-vault-green" />
          Target Wallet
        </label>
        <select
          {...register('walletId')}
          className={cn(
            "w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-gray-300 transition-all focus:outline-none focus:border-vault-green/50 appearance-none cursor-pointer",
            errors.walletId && "border-red-500/50"
          )}
        >
          <option value="">Select Wallet</option>
          {wallets.map(w => <option key={w.id || w._id} value={w.id || w._id}>{w.accountName} ({w.bankName})</option>)}
        </select>
        {errors.walletId && <p className="text-[10px] text-red-400 ml-1">{errors.walletId.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Type */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <ArrowRightLeft size={12} className="text-blue-400" />
            Type
          </label>
          <select
            {...register('type')}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-gray-300 transition-all focus:outline-none focus:border-vault-green/50 appearance-none cursor-pointer"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <DollarSign size={12} className="text-vault-green" />
            Amount
          </label>
          <input
            {...register('amount')}
            type="number"
            step="0.01"
            placeholder="0.00"
            className={cn(
              "w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50",
              errors.amount && "border-red-500/50"
            )}
          />
        </div>
      </div>

      {/* Category & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Category</label>
          <input
            {...register('category')}
            placeholder="e.g. Rent, Food"
            className={cn(
              "w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50",
              errors.category && "border-red-500/50"
            )}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Calendar size={12} className="text-orange-400" />
            Date
          </label>
          <input
            {...register('date')}
            type="date"
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-gray-400 transition-all focus:outline-none focus:border-vault-green/50 appearance-none"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
          <FileText size={12} className="text-gray-500" />
          Description (Optional)
        </label>
        <textarea
          {...register('description')}
          placeholder="What was this for?"
          rows={3}
          className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50 resize-none"
        />
      </div>

      {/* Submit Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        disabled={isSubmitting}
        type="submit"
        className="w-full flex items-center justify-between px-8 py-5 rounded-[1.25rem] bg-vault-green text-black font-bold text-sm shadow-xl shadow-vault-green/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <span className="flex items-center gap-2">
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Log Transaction'}
        </span>
        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </form>
  );
}

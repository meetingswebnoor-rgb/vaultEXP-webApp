'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Wallet, Landmark, DollarSign, ChevronRight, Loader2, CreditCard } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useActionStore } from '@/store/actionStore';
import { cn } from '@/lib/utils/cn';

const walletSchema = z.object({
  name: z.string().min(2, 'Wallet name is required'),
  accountType: z.string().default('checking'),
  bankName: z.string().optional(),
  balance: z.string().optional().transform(v => v ? parseFloat(v) : 0),
  currency: z.string().default('USD'),
});

type WalletFormValues = z.infer<typeof walletSchema>;

export function AddWalletForm() {
  const { closeAction } = useActionStore();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      accountType: 'checking',
      currency: 'USD',
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await api.post('/api/wallet', data);
      showToast('Wallet created successfully', 'success');
      closeAction();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to create wallet', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-6">
      {/* Name Field */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
          <Wallet size={12} className="text-vault-green" />
          Wallet Name
        </label>
        <input
          {...register('name')}
          placeholder="e.g. Primary Savings"
          className={cn(
            "w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50",
            errors.name && "border-red-500/50 focus:border-red-500"
          )}
        />
        {errors.name && <p className="text-[10px] text-red-400 ml-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Account Type */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <CreditCard size={12} className="text-blue-400" />
            Account Type
          </label>
          <select
            {...register('accountType')}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-gray-300 transition-all focus:outline-none focus:border-vault-green/50 appearance-none cursor-pointer"
          >
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="investment">Investment</option>
            <option value="crypto">Crypto</option>
            <option value="cash">Cash</option>
          </select>
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Currency</label>
          <select
            {...register('currency')}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-gray-300 transition-all focus:outline-none focus:border-vault-green/50 appearance-none cursor-pointer"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      {/* Bank Name */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
          <Landmark size={12} className="text-orange-400" />
          Institution / Bank Name
        </label>
        <input
          {...register('bankName')}
          placeholder="e.g. Chase Bank"
          className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50"
        />
      </div>

      {/* Initial Balance */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
          <DollarSign size={12} className="text-vault-green" />
          Initial Balance
        </label>
        <input
          {...register('balance')}
          type="number"
          step="0.01"
          placeholder="0.00"
          className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50"
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
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Link Wallet'}
        </span>
        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </form>
  );
}

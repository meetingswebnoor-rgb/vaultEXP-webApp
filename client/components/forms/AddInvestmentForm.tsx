'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, DollarSign, ChevronRight, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useActionStore } from '@/store/actionStore';
import { cn } from '@/lib/utils/cn';

const investmentSchema = z.object({
  name: z.string().min(2, 'Asset name is required'),
  ticker: z.string().optional(),
  type: z.string().default('stock'),
  platform: z.string().optional(),
  amountInvested: z.string().min(1, 'Amount invested is required').transform(v => parseFloat(v)),
  currentValue: z.string().optional().transform(v => v ? parseFloat(v) : undefined),
});

type InvestmentFormValues = z.infer<typeof investmentSchema>;

export function AddInvestmentForm() {
  const { closeAction } = useActionStore();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvestmentFormValues>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      type: 'stock',
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await api.post('/api/investment', data);
      showToast('Investment tracked successfully', 'success');
      closeAction();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to track investment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-6">
      {/* Name Field */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
          <TrendingUp size={12} className="text-vault-green" />
          Asset Name
        </label>
        <input
          {...register('name')}
          placeholder="e.g. Apple Inc. or Bitcoin"
          className={cn(
            "w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50",
            errors.name && "border-red-500/50 focus:border-red-500"
          )}
        />
        {errors.name && <p className="text-[10px] text-red-400 ml-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ticker */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Search size={12} className="text-blue-400" />
            Ticker / Symbol
          </label>
          <input
            {...register('ticker')}
            placeholder="e.g. AAPL"
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50 uppercase"
          />
        </div>

        {/* Type */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <BarChart3 size={12} className="text-orange-400" />
            Asset Type
          </label>
          <select
            {...register('type')}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-gray-300 transition-all focus:outline-none focus:border-vault-green/50 appearance-none cursor-pointer"
          >
            <option value="stock">Stock</option>
            <option value="crypto">Crypto</option>
            <option value="etf">ETF</option>
            <option value="real_estate">Real Estate</option>
            <option value="manual_asset">Manual Asset</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Amount Invested */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <DollarSign size={12} className="text-vault-green" />
            Amount Invested
          </label>
          <input
            {...register('amountInvested')}
            type="number"
            step="0.01"
            placeholder="0.00"
            className={cn(
              "w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50",
              errors.amountInvested && "border-red-500/50"
            )}
          />
        </div>

        {/* Current Value */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <TrendingUp size={12} className="text-vault-green" />
            Current Value
          </label>
          <input
            {...register('currentValue')}
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50"
          />
        </div>
      </div>

      {/* Platform */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Platform / Broker</label>
        <input
          {...register('platform')}
          placeholder="e.g. Robinhood, Binance, E*TRADE"
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
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Track Investment'}
        </span>
        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </form>
  );
}

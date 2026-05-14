'use client';

import { useState } from 'react';
import { X, Loader2, Target, DollarSign, Activity, Calendar, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';
import { GlobalModal } from '@/components/ui/GlobalModal';

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddInvestmentModal({ isOpen, onClose }: AddInvestmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    type: 'stock',
    amountInvested: '',
    currentValue: '',
    quantity: '1',
    platform: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/api/investment/create', {
        ...formData,
        amountInvested: Number(formData.amountInvested),
        currentValue: formData.currentValue ? Number(formData.currentValue) : Number(formData.amountInvested),
        quantity: Number(formData.quantity)
      });
      
      // Invalidate queries to refresh data and stats
      await queryClient.invalidateQueries({ queryKey: ['investments'] });
      
      // Reset form
      setFormData({ 
        name: '', 
        type: 'stock', 
        amountInvested: '', 
        currentValue: '',
        quantity: '1', 
        platform: '', 
        purchaseDate: new Date().toISOString().split('T')[0] 
      });
      
      // Show toast and close
      showToast('Investment added successfully', 'success');
      onClose();
    } catch (err: any) {
      console.error('[InvestmentModal] Submission Error:', err);
      setError(err.response?.data?.message || 'Failed to add investment. Please try again.');
      showToast('Failed to add investment', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Investment"
      description="Record a new asset in your portfolio."
      icon={<Target size={22} />}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="p-7 space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Asset Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Apple Stock, Bitcoin"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-vault-green/50 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Asset Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-vault-green/50 outline-none transition-all appearance-none"
            >
              <option value="stock">Stock / Equity</option>
              <option value="crypto">Cryptocurrency</option>
              <option value="mutual_fund">Mutual Fund / ETF</option>
              <option value="business">Private Business</option>
              <option value="manual_asset">Other Asset</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Platform (Optional)</label>
            <input
              type="text"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              placeholder="e.g. Robinhood"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-vault-green/50 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Amount Invested *</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amountInvested}
                onChange={(e) => setFormData({ ...formData, amountInvested: e.target.value })}
                placeholder="0.00"
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:border-vault-green/50 outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Current Value</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.currentValue}
                onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                placeholder="Same as invested"
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:border-vault-green/50 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Quantity</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input
                type="number"
                min="0"
                step="0.0001"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="1"
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:border-vault-green/50 outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Purchase Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-gray-400 focus:border-vault-green/50 outline-none transition-all appearance-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 pb-1">
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-vault-green text-black font-bold text-sm shadow-xl shadow-vault-green/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 transition-all"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Activity size={18} />}
            {isLoading ? 'Saving...' : 'Save Investment'}
          </motion.button>
        </div>
      </form>
    </GlobalModal>
  );
}

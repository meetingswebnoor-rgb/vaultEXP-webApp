'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Wallet, DollarSign, Building2, CreditCard, Briefcase, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';
import { GlobalModal } from '@/components/ui/GlobalModal';

interface EditWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: any;
}

export function EditWalletModal({ isOpen, onClose, wallet }: EditWalletModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: businesses } = useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      const res = await api.get('/api/business');
      return res.data.data;
    }
  });

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const res = await api.get('/api/property');
      return res.data.data;
    }
  });

  const [formData, setFormData] = useState({
    accountName: '',
    accountType: 'bank',
    bankName: '',
    maskedAccountNumber: '',
    balance: '',
    currency: 'USD',
    linkedBusinessId: '',
    linkedPropertyId: ''
  });

  useEffect(() => {
    if (wallet) {
      setFormData({
        accountName: wallet.accountName || '',
        accountType: wallet.accountType || 'bank',
        bankName: wallet.bankName || '',
        maskedAccountNumber: wallet.maskedAccountNumber || '',
        balance: String(wallet.balance || 0),
        currency: wallet.currency || 'USD',
        linkedBusinessId: wallet.linkedBusinessId || '',
        linkedPropertyId: wallet.linkedPropertyId || ''
      });
    }
  }, [wallet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.put(`/api/wallet/${wallet._id}`, {
        ...formData,
        balance: Number(formData.balance) || 0
      });

      await queryClient.invalidateQueries({ queryKey: ['wallets'] });
      await queryClient.invalidateQueries({ queryKey: ['wallet', wallet._id] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['wallet-analytics'] });
      
      showToast('Account updated successfully', 'success');
      onClose();
    } catch (err: any) {
      console.error('[EditWalletModal] Error:', err);
      setError(err.response?.data?.message || 'Failed to update account.');
      showToast('Failed to update account', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Account"
      description="Update your account settings."
      icon={<Wallet size={22} />}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="p-7 space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Account Name</label>
          <input
            type="text" required
            value={formData.accountName}
            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-vault-green/50 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Type</label>
            <select
              value={formData.accountType}
              onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-vault-green/50 outline-none appearance-none transition-all"
            >
              <option value="bank">Bank Account</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="digital_wallet">Digital Wallet</option>
              <option value="cash">Physical Cash</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Bank Name</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:border-vault-green/50 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Balance</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input
                type="number" step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:border-vault-green/50 outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Masked Number</label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input
                type="text"
                value={formData.maskedAccountNumber}
                onChange={(e) => setFormData({ ...formData, maskedAccountNumber: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:border-vault-green/50 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Link Business (Optional)</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <select
                value={formData.linkedBusinessId}
                onChange={(e) => setFormData({ ...formData, linkedBusinessId: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:border-vault-green/50 outline-none appearance-none transition-all"
              >
                <option value="">No Business</option>
                {businesses?.map((b: any) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Link Property (Optional)</label>
            <div className="relative">
              <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <select
                value={formData.linkedPropertyId}
                onChange={(e) => setFormData({ ...formData, linkedPropertyId: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:border-vault-green/50 outline-none appearance-none transition-all"
              >
                <option value="">No Property</option>
                {properties?.map((p: any) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            type="submit"
            className="w-full py-4 bg-vault-green text-black font-bold rounded-xl shadow-lg shadow-vault-green/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : null}
            {isLoading ? 'Updating...' : 'Save Changes'}
          </motion.button>
        </div>
      </form>
    </GlobalModal>
  );
}

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { AddWalletModal } from '@/components/wallet/AddWalletModal';
import { AddTransactionModal } from '@/components/wallet/AddTransactionModal';
import { GenerateStatementModal } from '@/components/wallet/GenerateStatementModal';
import { WalletListCard } from '@/components/mobile/wallet/WalletListCard';
import { DesktopWalletLayout } from '@/components/desktop/wallet/DesktopWalletLayout';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { 
  Loader2, 
  Plus, 
  AlertCircle, 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Landmark, 
  Activity,
  DollarSign,
  FileText,
  ArrowRightLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Wallet {
  _id: string;
  accountName: string;
  accountType: string;
  bankName: string;
  maskedAccountNumber: string;
  balance: number;
  currency: string;
  transactions: any[];
}

interface WalletResponse {
  success: boolean;
  data: Wallet[];
  summary: {
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
  };
}

export default function WalletPage() {
  const { isMobile, isTablet } = useBreakpoint();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);

  const { data, isLoading, isError } = useQuery<WalletResponse>({
    queryKey: ['wallets'],
    queryFn: async () => {
      const res = await api.get('/api/wallet');
      return res.data;
    },
    retry: 1
  });

  const wallets = data?.data ?? [];
  const summary = data?.summary ?? { totalBalance: 0, totalIncome: 0, totalExpenses: 0 };
  const hasWallets = wallets.length > 0;

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-vault-green animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mt-8">
          <AlertCircle size={18} />
          <span className="text-sm">Failed to load wallets. Please try again.</span>
        </div>
      </PageContainer>
    );
  }

  // Desktop View
  if (!isMobile && !isTablet) {
    return (
      <PageContainer>
        <AddWalletModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        <AddTransactionModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} wallets={wallets} />
        <GenerateStatementModal isOpen={isStatementModalOpen} onClose={() => setIsStatementModalOpen(false)} wallets={wallets} />
        
        <div className="mb-8">
          <PageHeader
            title="Wallet Dashboard"
            description="Institutional-grade asset tracking and ledger management."
          />
        </div>

        <DesktopWalletLayout 
          wallets={wallets} 
          summary={summary} 
          onAddWallet={() => setIsAddModalOpen(true)}
          onAddTransaction={() => setIsTxModalOpen(true)}
          onGenerateStatement={() => setIsStatementModalOpen(true)}
        />
      </PageContainer>
    );
  }

  // Mobile View
  return (
    <PageContainer>
      <AddWalletModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <AddTransactionModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} wallets={wallets} />
      <GenerateStatementModal isOpen={isStatementModalOpen} onClose={() => setIsStatementModalOpen(false)} wallets={wallets} />

      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Wallets"
          description="Manage your accounts and liquidity."
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAddModalOpen(true)}
          className="w-11 h-11 rounded-2xl bg-vault-green flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,255,136,0.2)]"
        >
          <Plus size={22} strokeWidth={3} />
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-mobile p-6 mb-8 relative overflow-hidden group"
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-vault-green/10 rounded-full blur-3xl group-hover:bg-vault-green/20 transition-all duration-700" />
        
        <div className="relative z-10">
          <p className="text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5">Total Liquidity</p>
          <h2 className="text-4xl font-display font-bold text-white mb-6">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(summary.totalBalance)}
          </h2>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.05]">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-vault-green">
                <ArrowUpRight size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Income</span>
              </div>
              <p className="text-lg font-bold text-white">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(summary.totalIncome)}
              </p>
            </div>
            <div className="space-y-1 border-l border-white/[0.05] pl-4">
              <div className="flex items-center gap-1.5 text-red-400">
                <ArrowDownLeft size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Expenses</span>
              </div>
              <p className="text-lg font-bold text-white">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(summary.totalExpenses)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-3 mb-8">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
          className="flex-1 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-sm"
        >
          <Plus size={16} /> Wallet
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsTxModalOpen(true)}
          className="flex-1 py-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center gap-2 text-blue-400 font-bold text-sm"
        >
          <ArrowRightLeft size={16} /> Tx
        </motion.button>
      </div>

      <div className="space-y-4 pb-10">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Landmark size={18} className="text-vault-green" />
            Active Accounts
          </h3>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{wallets.length} accounts</span>
        </div>

        {!hasWallets ? (
          <div className="p-10 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
            <div className="w-16 h-16 rounded-full bg-vault-dark mx-auto flex items-center justify-center text-gray-600 mb-4 border border-vault-border">
              <WalletIcon size={28} />
            </div>
            <p className="text-white font-bold mb-2 text-lg">Your wallet is empty</p>
            <p className="text-gray-500 text-sm max-w-[200px] mx-auto">Link your first bank account to start tracking.</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddModalOpen(true)}
              className="mt-6 px-6 py-2.5 bg-vault-green text-black font-bold rounded-xl text-sm"
            >
              Add Wallet Now
            </motion.button>
          </div>
        ) : (
          <div className="space-y-3">
            {wallets.map((wallet, i) => (
              <motion.div
                key={wallet._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <WalletListCard
                  _id={wallet._id}
                  accountName={wallet.accountName}
                  accountType={wallet.accountType}
                  bankName={wallet.bankName}
                  maskedAccountNumber={wallet.maskedAccountNumber}
                  balance={wallet.balance}
                  currency={wallet.currency}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

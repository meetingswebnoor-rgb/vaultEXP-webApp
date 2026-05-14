'use client';

import Link from 'next/link';
import { CreditCard, Landmark, Wallet as WalletIcon, Smartphone, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';

interface WalletListCardProps {
  _id: string;
  accountName: string;
  accountType: string;
  bankName?: string;
  maskedAccountNumber?: string;
  balance: number;
  currency: string;
}

export function WalletListCard({
  _id,
  accountName,
  accountType,
  bankName,
  maskedAccountNumber,
  balance,
  currency = 'USD'
}: WalletListCardProps) {
  
  const getIcon = () => {
    switch (accountType) {
      case 'bank': return <Landmark size={20} />;
      case 'credit_card': return <CreditCard size={20} />;
      case 'debit_card': return <CreditCard size={20} />;
      case 'digital_wallet': return <Smartphone size={20} />;
      case 'cash': return <Banknote size={20} />;
      default: return <WalletIcon size={20} />;
    }
  };

  const getAccentColor = () => {
    switch (accountType) {
      case 'bank': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'credit_card': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'digital_wallet': return 'text-vault-green bg-vault-green/10 border-vault-green/20';
      case 'cash': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(balance || 0);

  return (
    <Link href={`/wallet/${_id}`} className="block">
      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-center justify-between hover:bg-white/[0.04] transition-all"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${getAccentColor()}`}>
            {getIcon()}
          </div>
          <div>
            <h3 className="text-white font-bold text-base truncate max-w-[160px]">{accountName}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{bankName || accountType.replace('_', ' ')}</p>
              {maskedAccountNumber && (
                <span className="text-gray-600 text-[10px] font-mono">{maskedAccountNumber}</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-bold font-display">{formattedBalance}</p>
          <p className="text-[10px] text-gray-500 mt-0.5 font-bold uppercase tracking-widest">Balance</p>
        </div>
      </motion.div>
    </Link>
  );
}

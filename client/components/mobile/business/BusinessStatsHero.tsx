'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface BusinessStatsHeroProps {
  revenue: string;
  expenses: string;
  profit: string;
  color?: string;
}

export function BusinessStatsHero({ revenue, expenses, profit, color = '#FB923C' }: BusinessStatsHeroProps) {
  return (
    <div className="relative mb-8 pt-4">
      {/* Large Central Value (Profit) */}
      <div className="text-center mb-8">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Net Profit (MTD)</p>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-display font-bold text-white tracking-tight"
        >
          {profit}
        </motion.h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Revenue Card */}
        <div className="relative overflow-hidden rounded-[28px] bg-vault-card/40 border border-white/10 p-5 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-vault-green/10 flex items-center justify-center text-vault-green border border-vault-green/20">
              <TrendingUp size={16} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Revenue</span>
          </div>
          <p className="text-xl font-bold text-white">{revenue}</p>
          {/* Ambient Glow */}
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-vault-green/10 blur-xl rounded-full" />
        </div>

        {/* Expenses Card */}
        <div className="relative overflow-hidden rounded-[28px] bg-vault-card/40 border border-white/10 p-5 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
              <TrendingDown size={16} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expenses</span>
          </div>
          <p className="text-xl font-bold text-white">{expenses}</p>
          {/* Ambient Glow */}
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-red-500/5 blur-xl rounded-full" />
        </div>
      </div>
    </div>
  );
}

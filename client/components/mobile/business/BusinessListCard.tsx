'use client';

import { motion } from 'framer-motion';
import { Briefcase, ArrowRight, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BusinessListCardProps {
  id: string;
  name: string;
  type: string;
  revenue?: string;
  expenses?: string;
  color?: string;
}

export function BusinessListCard({ id, name, type, revenue = '$0', expenses = '$0', color = '#FB923C' }: BusinessListCardProps) {
  const router = useRouter();

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/business/${id}`)}
      className="w-full relative overflow-hidden rounded-[32px] p-6 text-left border border-white/10 bg-vault-card/40 backdrop-blur-xl group mb-4"
    >
      {/* Ambient Glow */}
      <div 
        className="absolute -top-12 -right-12 w-32 h-32 blur-[40px] opacity-10 rounded-full pointer-events-none"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center border"
            style={{ backgroundColor: `${color}15`, borderColor: `${color}30`, color: color }}
          >
            <Briefcase size={22} strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-white">{name}</h3>
            <p className="text-xs text-gray-500 font-medium">{type}</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-white transition-colors">
          <ArrowRight size={18} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Est. Revenue</p>
          <p className="text-base font-bold text-vault-green">{revenue}</p>
        </div>
        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Expenses</p>
          <p className="text-base font-bold text-white">{expenses}</p>
        </div>
      </div>
    </motion.button>
  );
}

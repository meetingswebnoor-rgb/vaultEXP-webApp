'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Send, Receipt, CheckSquare, BarChart2, 
  Sparkles, AlertTriangle, TrendingUp, ShieldCheck 
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useActionStore } from '@/store/actionStore';

export function MobileFinanceHub() {
  const { openAction } = useActionStore();

  return (
    <div className="flex flex-col gap-6 px-4 py-6 pb-24">
      {/* 1. Hero Balance Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-vault-green/20 to-vault-green/5 border border-vault-green/20 p-6 shadow-[0_10px_40px_rgba(0,255,136,0.1)]"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-vault-green/20 blur-3xl rounded-full pointer-events-none" />
        <p className="text-vault-green text-sm font-semibold tracking-wider uppercase mb-1">Total Liquidity</p>
        <h2 className="text-4xl font-display font-black text-white mb-4 tracking-tight">$124,500.00</h2>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span className="flex items-center justify-center bg-vault-green/20 text-vault-green rounded-full px-2 py-0.5 font-bold text-[10px]">
            +12.4%
          </span>
          <span className="text-xs">vs last month</span>
        </div>
      </motion.div>

      {/* 2. Operations Ribbon */}
      <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 -mx-4 px-4 snap-x">
        <OperationButton 
          icon={Send} 
          label="Send Invoice" 
          color="blue"
          onClick={() => openAction('invoice')} 
        />
        <OperationButton 
          icon={Receipt} 
          label="Track Payments" 
          color="purple"
          onClick={() => openAction('transaction')} 
        />
        <OperationButton 
          icon={CheckSquare} 
          label="Approve Expenses" 
          color="orange"
          onClick={() => openAction('expense')} 
        />
        <OperationButton 
          icon={BarChart2} 
          label="Review Analytics" 
          color="vault-green"
          onClick={() => {}} 
        />
      </div>

      {/* 3. AI Financial Digest */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl bg-[#080C0F]/80 border border-white/5 p-6 relative overflow-hidden"
      >
        {/* Glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-vault-green/5 to-transparent blur-xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-8 h-8 rounded-full bg-vault-green/10 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.2)]">
            <Sparkles className="text-vault-green w-4 h-4" />
          </div>
          <h3 className="text-lg font-bold text-white font-display">AI Financial Digest</h3>
        </div>

        <div className="space-y-3 relative z-10">
          <DigestItem 
            icon={TrendingUp} 
            title="Spending is up 12%" 
            desc="Driven by increased marketing spend this week."
            color="text-yellow-400"
            bg="bg-yellow-400/10"
            borderColor="border-yellow-400/20"
          />
          <DigestItem 
            icon={AlertTriangle} 
            title="3 Invoices Overdue" 
            desc="$4,200 total pending from top clients."
            color="text-red-400"
            bg="bg-red-400/10"
            borderColor="border-red-400/20"
          />
          <DigestItem 
            icon={ShieldCheck} 
            title="Low Liquidity Risk" 
            desc="Cash reserves cover operating expenses for 8+ months."
            color="text-vault-green"
            bg="bg-vault-green/10"
            borderColor="border-vault-green/20"
          />
        </div>
      </motion.div>
    </div>
  );
}

function OperationButton({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: string, onClick: () => void }) {
  const bgClasses = color === 'blue' ? 'from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40' :
                    color === 'purple' ? 'from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40' :
                    color === 'orange' ? 'from-orange-500/10 to-orange-600/5 border-orange-500/20 hover:border-orange-500/40' :
                    'from-vault-green/10 to-vault-green/5 border-vault-green/20 hover:border-vault-green/40';

  const iconColor = color === 'blue' ? 'text-blue-400' :
                    color === 'purple' ? 'text-purple-400' :
                    color === 'orange' ? 'text-orange-400' :
                    'text-vault-green';

  const iconBg = color === 'blue' ? 'bg-blue-500/20' :
                 color === 'purple' ? 'bg-purple-500/20' :
                 color === 'orange' ? 'bg-orange-500/20' :
                 'bg-vault-green/20';

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "snap-center flex flex-col items-center justify-center gap-3 w-[104px] h-[104px] flex-shrink-0 rounded-2xl border bg-gradient-to-b transition-colors",
        bgClasses
      )}
    >
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", iconBg)}>
        <Icon className={iconColor} size={18} />
      </div>
      <span className="text-[11px] font-bold text-white text-center leading-tight px-1">{label}</span>
    </motion.button>
  );
}

function DigestItem({ icon: Icon, title, desc, color, bg, borderColor }: { icon: any, title: string, desc: string, color: string, bg: string, borderColor: string }) {
  return (
    <div className={cn("flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border transition-colors hover:bg-white/[0.04]", borderColor)}>
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner", bg)}>
        <Icon className={color} size={18} />
      </div>
      <div>
        <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
        <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

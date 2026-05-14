'use client';

import { Building2, Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function PropertyEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-vault-dark/20 p-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mb-8"
      >
        <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-vault-green/20 to-vault-green/5 border border-vault-green/20 flex items-center justify-center relative z-10">
          <Building2 size={40} className="text-vault-green" strokeWidth={1.5} />
        </div>
        
        {/* Decorative glow */}
        <div className="absolute inset-0 bg-vault-green/20 blur-[60px] -z-10 animate-pulse" />
        
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-4 -right-4 w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center backdrop-blur-md"
        >
          <Sparkles size={16} className="text-amber-400" />
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-[24px] font-bold font-display text-white mb-3"
      >
        Start Your Property Portfolio
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-gray-500 text-[15px] max-w-[320px] leading-relaxed mb-10"
      >
        Add your first property to start managing your real estate, tracking rent, and automating alerts.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={onAdd}
        className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl bg-vault-green text-black font-bold text-[15px] shadow-2xl shadow-vault-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        <Plus size={18} strokeWidth={2.5} />
        Add Property
        
        <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.button>
    </div>
  );
}

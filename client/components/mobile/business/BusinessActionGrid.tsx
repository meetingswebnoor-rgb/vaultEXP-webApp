'use client';

import { motion } from 'framer-motion';
import { Plus, FileText, UploadCloud, Receipt } from 'lucide-react';
import { useActionStore } from '@/store/actionStore';

const ACTIONS = [
  { label: 'Add Expense', icon: Receipt, color: '#F87171', action: 'expense' },
  { label: 'New Invoice', icon: FileText, color: '#3B82F6', action: 'invoice' },
  { label: 'Upload Doc', icon: UploadCloud, color: '#A855F7', action: 'document' },
];

export function BusinessActionGrid() {
  const { openAction } = useActionStore();

  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {ACTIONS.map((action: any, i) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={i}
            whileTap={{ scale: 0.94 }}
            onClick={() => openAction(action.action)}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/[0.03] border border-white/5 py-4"
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{ backgroundColor: `${action.color}10`, borderColor: `${action.color}20`, color: action.color }}
            >
              <Icon size={18} strokeWidth={2} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{action.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

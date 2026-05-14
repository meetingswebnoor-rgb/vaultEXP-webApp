'use client';

import { motion } from 'framer-motion';
import { Briefcase, Building2, CreditCard, UploadCloud } from 'lucide-react';
import { useActionStore, ActionType } from '@/store/actionStore';

const ACTIONS: Array<{ id: string; actionKey: ActionType; label: string; icon: any; bg: string; border: string; iconColor: string; glow: string }> = [
  {
    id: 'action-add-business',
    actionKey: 'business',
    label: 'Add Business',
    icon: Briefcase,
    bg: 'from-orange-500/20 to-orange-600/10',
    border: 'border-orange-500/20',
    iconColor: 'text-orange-400',
    glow: 'rgba(251,146,60,0.15)',
  },
  {
    id: 'action-add-property',
    actionKey: 'property',
    label: 'Add Property',
    icon: Building2,
    bg: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
    glow: 'rgba(59,130,246,0.15)',
  },
  {
    id: 'action-add-card',
    actionKey: 'card',
    label: 'Add Card',
    icon: CreditCard,
    bg: 'from-vault-green/20 to-vault-green/5',
    border: 'border-vault-green/20',
    iconColor: 'text-vault-green',
    glow: 'rgba(0,255,136,0.15)',
  },
  {
    id: 'action-upload',
    actionKey: 'document',
    label: 'Upload Document',
    icon: UploadCloud,
    bg: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-500/20',
    iconColor: 'text-purple-400',
    glow: 'rgba(168,85,247,0.15)',
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, x: 20 },
  show:  { opacity: 1, scale: 1,   x: 0,
    transition: { type: 'spring', damping: 18, stiffness: 300 },
  },
};

export function QuickActions() {
  const { openAction } = useActionStore();

  return (
    <div className="mt-5">
      <div className="px-5 flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex gap-3 overflow-x-auto px-5 pb-4 snap-x custom-scrollbar"
      >
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              id={action.id}
              onClick={() => openAction(action.actionKey)}
              variants={itemVariants}
              whileTap={{ scale: 0.88 }}
              className={`relative flex flex-col items-center gap-2 rounded-2xl py-4 px-3
                         min-w-[100px] snap-center flex-shrink-0
                         bg-gradient-to-br ${action.bg}
                         border ${action.border}
                         backdrop-blur-sm transition-shadow`}
              style={{ boxShadow: `0 4px 20px ${action.glow}` }}
            >
              {/* Icon circle */}
              <div className={`h-10 w-10 rounded-xl bg-black/30 border ${action.border}
                              flex items-center justify-center ${action.iconColor}`}>
                <Icon size={18} strokeWidth={1.8} />
              </div>
              <span className="text-[11px] font-semibold text-white/80 whitespace-nowrap">{action.label}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

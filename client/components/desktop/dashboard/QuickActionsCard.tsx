'use client';

import { motion } from 'framer-motion';
import { Briefcase, Building2, CreditCard, UploadCloud, Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
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

export function QuickActionsCard() {
  const { openAction } = useActionStore();

  return (
    <div className="rounded-2xl border border-vault-border/60 bg-vault-card/40 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-vault-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-vault-dark/60 flex items-center justify-center text-vault-green border border-vault-green/20">
            <Zap size={16} />
          </div>
          <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 p-5 grid grid-cols-2 gap-3 overflow-y-auto">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              onClick={() => openAction(action.actionKey)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'relative flex flex-col items-center justify-center gap-3 rounded-2xl p-4 text-center',
                `bg-gradient-to-br ${action.bg}`,
                `border ${action.border}`,
                'backdrop-blur-sm transition-all hover:brightness-110'
              )}
              style={{ boxShadow: `0 8px 24px ${action.glow}` }}
            >
              <div className={cn(
                'h-10 w-10 rounded-xl bg-black/40 border flex items-center justify-center',
                action.border,
                action.iconColor
              )}>
                <Icon size={18} strokeWidth={1.8} />
              </div>
              <span className="text-[12px] font-semibold text-white/90">
                {action.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

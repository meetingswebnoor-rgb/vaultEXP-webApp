'use client';

import { motion } from 'framer-motion';
import { LucideIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-12 text-center rounded-3xl',
      'border border-dashed border-vault-border bg-vault-card/20',
      className
    )}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 text-gray-500">
          <Icon size={32} strokeWidth={1.5} />
        </div>
      )}
      
      <h3 className="text-lg font-display font-semibold text-white mb-2 tracking-tight">
        {title}
      </h3>
      
      <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onAction}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-vault-green text-black font-bold text-sm shadow-lg shadow-vault-green/20 hover:bg-vault-green-hover transition-colors"
        >
          <Plus size={18} strokeWidth={2.5} />
          {actionLabel}
        </motion.button>
      )}
    </div>
  );
}

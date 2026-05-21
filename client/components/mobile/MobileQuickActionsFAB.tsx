'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Briefcase, Building2, CreditCard, UploadCloud } from 'lucide-react';
import { useActionStore } from '@/store/actionStore';
import { ActionType } from '@/store/actionStore';
import { cn } from '@/lib/utils/cn';

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

export function MobileQuickActionsFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const { openAction } = useActionStore();

  // Prevent background scrolling when bottom sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleAction = (key: ActionType) => {
    setIsOpen(false);
    openAction(key);
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
        )}
      </AnimatePresence>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                setIsOpen(false);
              }
            }}
            className="fixed bottom-0 left-0 right-0 bg-vault-card border-t border-white/10 rounded-t-3xl z-[101] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            <div className="px-6 pb-10 pt-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-bold text-lg text-white">Quick Actions</h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      onClick={() => handleAction(action.actionKey)}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border",
                        "bg-gradient-to-br transition-all",
                        action.bg, action.border
                      )}
                    >
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-black/30", action.iconColor)}>
                        <Icon size={24} />
                      </div>
                      <span className="text-xs font-bold text-white/90">{action.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-[80px] right-5 w-14 h-14 rounded-full shadow-2xl z-[90]",
          "bg-vault-green text-[#05050A] flex items-center justify-center",
          "border border-[#00FF88]/50"
        )}
        style={{ boxShadow: '0 8px 32px rgba(0,255,136,0.3)' }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <Plus size={28} strokeWidth={2.5} />
        </motion.div>
      </motion.button>
    </>
  );
}

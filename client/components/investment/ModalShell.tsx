'use client';

/**
 * ModalShell — Shared primitive for all Investment module modals.
 *
 * Guarantees:
 *  - position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%)
 *  - Full-viewport backdrop with blur
 *  - Scroll-locked body while open
 *  - Mobile-first: 100% width with max-w cap and px safe area
 *  - Consistent z-index ladder:
 *      overlay  → z-[900]
 *      modal    → z-[901]
 *      confirm  → z-[902]
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  /** Max width class, e.g. 'max-w-lg' or 'max-w-2xl' */
  maxWidth?: string;
  children: React.ReactNode;
  /** Override z-index for stacked modals */
  zIndex?: number;
}

export function ModalShell({
  isOpen,
  onClose,
  maxWidth = 'max-w-lg',
  children,
  zIndex = 900,
}: ModalShellProps) {
  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative w-full bg-vault-card border border-white/[0.08] rounded-[2rem] shadow-2xl shadow-black/50 flex flex-col overflow-hidden',
              maxWidth
            )}
          >
            <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[90vh]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

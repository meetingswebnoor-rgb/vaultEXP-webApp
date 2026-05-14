'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface GlobalModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  maxWidth?: 'max-w-sm' | 'max-w-md' | 'max-w-lg' | 'max-w-xl' | 'max-w-2xl' | 'max-w-4xl';
  className?: string;
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
}

export function GlobalModal({
  isOpen,
  onClose,
  children,
  title,
  description,
  icon,
  maxWidth = 'max-w-lg',
  className,
  showCloseButton = true,
  closeOnOutsideClick = true
}: GlobalModalProps) {
  
  // ── Handle ESC key ──
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnOutsideClick ? onClose : undefined}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, duration: 0.3 }}
            className={cn(
              'relative w-full bg-vault-card border border-white/[0.08] rounded-[2rem] shadow-2xl shadow-black/50 flex flex-col overflow-hidden',
              maxWidth,
              className
            )}
          >
            {/* Optional Header (if title exists) */}
            {title && (
              <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.06] bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className="w-10 h-10 rounded-xl bg-vault-green/10 border border-vault-green/20 flex items-center justify-center text-vault-green">
                      {icon}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-display font-bold text-white leading-tight">{title}</h3>
                    {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
                  </div>
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}

            {/* Absolute Close Button (fallback if no title) */}
            {!title && showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[calc(90vh-80px)]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

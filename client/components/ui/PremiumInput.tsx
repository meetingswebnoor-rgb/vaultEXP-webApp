'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface PremiumInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {/* Neon Border Glow Effect */}
          <div className={cn(
            "absolute -inset-[1px] rounded-xl bg-gradient-to-r from-vault-emerald/50 to-vault-cyan/50 opacity-0 blur-sm transition-opacity duration-300",
            isFocused && "opacity-100",
            error && "from-red-500/50 to-red-500/50 opacity-100"
          )} />
          
          <div className="relative flex items-center">
            {icon && (
              <div className="absolute left-4 text-gray-400 group-focus-within:text-vault-emerald transition-colors">
                {icon}
              </div>
            )}
            <input
              ref={ref}
              className={cn(
                "w-full rounded-xl border border-white/10 bg-vault-obsidian/60 backdrop-blur-md px-4 py-3.5 text-white placeholder-gray-500 outline-none transition-all duration-300",
                "focus:bg-vault-navy/80 focus:border-white/20",
                icon && "pl-11",
                error && "border-red-500/50 focus:border-red-500",
                className
              )}
              onFocus={(e) => {
                setIsFocused(true);
                props.onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                props.onBlur?.(e);
              }}
              {...props}
            />
          </div>
        </div>
        
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-1.5 ml-1 text-xs text-red-400 font-medium"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

PremiumInput.displayName = 'PremiumInput';

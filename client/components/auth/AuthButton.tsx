'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AuthButtonProps {
  children: ReactNode;
  isLoading?: boolean;
  type?: 'submit' | 'button';
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
}

export function AuthButton({ 
  children, 
  isLoading, 
  type = 'submit', 
  onClick, 
  className,
  icon 
}: AuthButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "relative w-full py-3.5 bg-vault-green text-vault-darker font-bold rounded-xl flex items-center justify-center gap-2",
        "shadow-[0_4px_20px_rgba(0,255,136,0.2)] hover:shadow-[0_4px_25px_rgba(0,255,136,0.4)]",
        "transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden",
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={20} />
          <span>Processing...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {children}
          {icon && !isLoading && icon}
        </div>
      )}

      {/* Subtle Glow Effect on Hover */}
      <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.button>
  );
}

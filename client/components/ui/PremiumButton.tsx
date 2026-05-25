'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

interface PremiumButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function PremiumButton({ 
  children, 
  className, 
  variant = 'primary', 
  isLoading, 
  icon,
  disabled,
  ...props 
}: PremiumButtonProps) {
  
  const baseStyles = "relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-vault-obsidian disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group";
  
  const variants = {
    primary: "bg-vault-emerald text-vault-obsidian hover:bg-[#00FFAA] focus:ring-vault-emerald shadow-[0_0_20px_rgba(0,230,118,0.2)] hover:shadow-[0_0_30px_rgba(0,230,118,0.4)]",
    secondary: "bg-white/10 text-white backdrop-blur-md border border-white/10 hover:bg-white/20 hover:border-white/30 focus:ring-white/30",
    outline: "bg-transparent text-vault-emerald border border-vault-emerald/50 hover:bg-vault-emerald/10 hover:border-vault-emerald focus:ring-vault-emerald shadow-[0_0_15px_rgba(0,230,118,0.1)]",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={cn(baseStyles, variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Animated Shine Effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
      
      <span className="relative z-10 flex items-center gap-2">
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : icon}
        {children}
      </span>
    </motion.button>
  );
}

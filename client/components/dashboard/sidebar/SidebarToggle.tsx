'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SidebarToggleProps {
  collapsed: boolean;
  onToggle: () => void;
}

/**
 * SidebarToggle — Premium floating circular toggle
 * Glass morphism UI with neon accents.
 */
export function SidebarToggle({ collapsed, onToggle }: SidebarToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "absolute -right-3.5 top-24 h-7 w-7 rounded-full z-[100] flex items-center justify-center transition-all duration-300",
        "bg-vault-dark/80 backdrop-blur-xl border border-vault-green/30",
        "shadow-[0_0_15px_rgba(0,0,0,0.4),0_0_8px_rgba(0,255,136,0.1)]",
        "hover:border-vault-green/60 hover:shadow-[0_0_20px_rgba(0,255,136,0.2)] hover:scale-110 active:scale-90 group"
      )}
    >
      <motion.div
        animate={{ rotate: collapsed ? 0 : 180 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="flex items-center justify-center text-vault-green group-hover:text-white transition-colors"
      >
        <ChevronRight size={14} strokeWidth={2.5} />
      </motion.div>

      {/* Subtle pulsing core */}
      <div className="absolute inset-1 rounded-full bg-vault-green/5 animate-pulse" />
    </button>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAppShell } from '@/components/shell/AppShellContext';
import { cn } from '@/lib/utils/cn';
import { usePathname } from 'next/navigation';

export function FloatingAIOrb() {
  const { toggleAISidebar, aiSidebarOpen } = useAppShell();
  const pathname = usePathname();

  // Hide orb if user is on full-width AI view
  if (pathname === '/ai') return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-6 z-40">
      <motion.button
        id="floating-ai-orb-btn"
        onClick={toggleAISidebar}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="relative w-14 h-14 rounded-full flex items-center justify-center bg-black border border-vault-green/40 shadow-[0_0_30px_rgba(0,255,136,0.25)] outline-none group"
      >
        {/* Pulsing Backglow */}
        <div className="absolute inset-0 rounded-full bg-vault-green/20 blur-md group-hover:bg-vault-green/30 transition-all duration-300 animate-pulse" />
        
        {/* Spinning Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-1.5 rounded-full border border-dashed border-vault-green/15"
        />

        {/* Center Sparkle Icon */}
        <motion.div
          animate={aiSidebarOpen ? { rotate: 90 } : { rotate: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 text-vault-green group-hover:scale-110 transition-transform duration-300"
        >
          <Sparkles className="w-6 h-6 text-vault-green fill-vault-green/10" />
        </motion.div>
      </motion.button>
    </div>
  );
}

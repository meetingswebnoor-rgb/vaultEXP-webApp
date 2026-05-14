'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ReactNode } from 'react';

interface DesktopAuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function DesktopAuthLayout({ children, title, subtitle }: DesktopAuthLayoutProps) {
  return (
    <div className="min-h-screen bg-vault-darker flex overflow-hidden">
      {/* ── Left Side: Branding & Visual ──────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#05050A] p-12 flex-col justify-between">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-vault-green/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full" />
        </div>

        {/* Header */}
        <div className="relative z-10">
          <Image
            src="/logo.png"
            alt="VaultEXP"
            width={160}
            height={40}
            className="object-contain"
            priority
          />
        </div>

        {/* Central Content */}
        <div className="relative z-10 max-w-lg">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl font-display font-bold text-white leading-tight"
          >
            Manage your <br />
            <span className="text-vault-green">Digital Empire</span> <br />
            with Intelligence.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-gray-500 mt-6 text-lg"
          >
            Unified asset management for the modern entrepreneur. 
            Connect your businesses, properties, and investments in one high-performance vault.
          </motion.p>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-gray-600 text-sm">
          © 2026 VaultEXP Technologies. All rights reserved.
        </div>
      </div>

      {/* ── Right Side: Auth Form ───────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[440px] space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-white">{title}</h1>
            <p className="text-gray-500">{subtitle}</p>
          </div>
          
          <div className="glass-card p-8 border-vault-border/40">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

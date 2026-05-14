'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-vault-darker flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* ── Background Blobs ─────────────────────────────────── */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-vault-green/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* ── Content ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[400px] relative z-10"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.png"
            alt="VaultEXP"
            width={140}
            height={36}
            className="object-contain"
            priority
          />
        </div>
        {children}
      </motion.div>
    </div>
  );
}

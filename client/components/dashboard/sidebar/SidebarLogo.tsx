'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { VaultAIOrb } from '@/components/branding/VaultAIOrb';

interface SidebarLogoProps {
  collapsed: boolean;
}

/**
 * SidebarLogo — Premium large branding component
 * Optimized for aspect ratio and visual balance.
 */
export function SidebarLogo({ collapsed }: SidebarLogoProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center flex-shrink-0 relative group transition-all duration-500 overflow-hidden",
      collapsed ? "h-16" : "h-24"
    )}>
      {/* Ambient Neon Glow behind logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-32 h-32 bg-vault-green/5 blur-[40px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
      </div>

      <Link
        href="/dashboard"
        className="relative z-10 flex items-center justify-center transition-all duration-500 hover:scale-[1.03] active:scale-95"
      >
        <div className="relative flex items-center justify-center">
          {/* Conditional Logo Rendering */}
          {collapsed ? (
            <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <VaultAIOrb size={38} glow={true} animated={true} compact={true} />
            </div>
          ) : (
            <Image
              src="/dlogo.png"
              alt="VaultEXP"
              width={170}
              height={50}
              priority
              className="object-contain drop-shadow-[0_0_15px_rgba(0,255,136,0.15)]"
            />
          )}
        </div>
      </Link>
    </div>
  );
}

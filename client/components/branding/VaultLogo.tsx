"use client";

import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface VaultLogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

/**
 * Universal VaultEXP Logo Component — Icon Only
 * Simplified and centered as per updated branding guidelines.
 */
export default function VaultLogo({
  size = 48,
  className,
  priority = true,
}: VaultLogoProps) {
  return (
    <div className={cn("flex items-center justify-center select-none", className)}>
      <div className="relative flex items-center justify-center">
        {/* Premium Glow Effect — Increased for larger logo size */}
        <div className="absolute inset-[-20%] bg-blue-500/20 blur-3xl rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative z-10 transition-all duration-500 group-hover:scale-110 active:scale-95">
          <Image
            src="/dlogo.png"
            alt="VaultEXP"
            width={size}
            height={size}
            priority={priority}
            className="object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
          />
        </div>
      </div>
    </div>
  );
}

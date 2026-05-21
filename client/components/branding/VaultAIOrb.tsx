'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface VaultAIOrbProps {
  size?: number;
  glow?: boolean;
  animated?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * VaultAIOrb — The dynamic, code-generated official AI visual identity for VaultEXP.
 * Premium, futuristic, and lightweight SVG-based component.
 */
export function VaultAIOrb({
  size = 24,
  glow = true,
  animated = false,
  compact = false,
  className,
}: VaultAIOrbProps) {
  return (
    <div 
      className={cn("relative flex items-center justify-center flex-shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {/* Outer Ambient Glow */}
      {glow && (
        <motion.div
          animate={animated ? { 
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3] 
          } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[#00ff99]/20 blur-[10px] rounded-full pointer-events-none"
          style={{ transform: compact ? 'scale(1.1)' : 'scale(1.2)' }}
        />
      )}

      {/* Rotating Outer Ring (Subtle) */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full text-[#00ff99] opacity-30 pointer-events-none"
        animate={animated ? { rotate: 360 } : {}}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="8 12 24 12" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.4" />
      </motion.svg>

      {/* Core Dark Metallic Background */}
      <div 
        className={cn(
          "absolute bg-gradient-to-br from-[#111827] to-[#0f172a] rounded-full border overflow-hidden",
          "shadow-[inset_0_0_12px_rgba(0,255,153,0.15)] pointer-events-none"
        )}
        style={{ 
          inset: '12%', 
          borderColor: 'rgba(0, 255, 153, 0.3)' 
        }}
      >
        {/* Inner AI Energy Shimmer */}
        {animated && (
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 mix-blend-screen"
            style={{
              background: 'radial-gradient(circle at center, rgba(0,255,153,0.4) 0%, transparent 60%)',
              backgroundSize: '150% 150%'
            }}
          />
        )}
      </div>

      {/* Center AI Node / Shield Pattern */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full pointer-events-none"
        animate={animated ? { scale: [0.96, 1.04, 0.96] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#00ff99" />
            <stop offset="100%" stopColor="#00d084" />
          </linearGradient>
          <filter id="coreGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Hexagon Shield */}
        <polygon 
          points="50,22 74,36 74,64 50,78 26,64 26,36" 
          fill="none" 
          stroke="url(#coreGrad)" 
          strokeWidth="3.5" 
          filter="url(#coreGlow)"
          opacity="0.85"
        />
        
        {/* Center Neural Node */}
        <circle cx="50" cy="50" r="9" fill="#ffffff" filter="url(#coreGlow)" />
        
        {/* Connection Lines */}
        <g stroke="#00ff99" strokeWidth="1.5" opacity="0.6">
          <line x1="50" y1="22" x2="50" y2="12" />
          <line x1="50" y1="78" x2="50" y2="88" />
          <line x1="26" y1="36" x2="16" y2="30" />
          <line x1="74" y1="64" x2="84" y2="70" />
          <line x1="26" y1="64" x2="16" y2="70" />
          <line x1="74" y1="36" x2="84" y2="30" />
        </g>
      </motion.svg>
    </div>
  );
}

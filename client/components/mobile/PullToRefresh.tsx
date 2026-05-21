'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

const PULL_THRESHOLD = 80;
const MAX_PULL = 150;

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  
  // Track scroll position to ensure we only pull when at the top
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setIsAtTop(containerRef.current.scrollTop <= 0);
      }
    };
    
    const el = containerRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleDrag = (event: any, info: PanInfo) => {
    if (!isAtTop || isRefreshing) return;
    
    // Only allow pulling down
    if (info.offset.y > 0) {
      const y = Math.min(info.offset.y, MAX_PULL);
      const progress = Math.min(y / PULL_THRESHOLD, 1);
      setPullProgress(progress);
      controls.set({ y: Math.pow(y, 0.8) }); // Apply slight friction curve
    }
  };

  const handleDragEnd = async (event: any, info: PanInfo) => {
    if (!isAtTop || isRefreshing) return;
    
    if (info.offset.y >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      controls.start({ y: 50, transition: { type: 'spring', stiffness: 300, damping: 20 } });
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullProgress(0);
        controls.start({ y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } });
      }
    } else {
      setPullProgress(0);
      controls.start({ y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } });
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn("h-full w-full overflow-y-auto overflow-x-hidden relative overscroll-y-none custom-scrollbar", className)}
    >
      {/* Pull indicator */}
      <div className="absolute top-0 left-0 w-full flex justify-center pointer-events-none -mt-12 h-12 items-center">
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: isRefreshing ? 1 : Math.max(0, pullProgress), 
            opacity: isRefreshing ? 1 : pullProgress,
            rotate: isRefreshing ? 360 : pullProgress * 180 
          }}
          transition={{
            rotate: isRefreshing ? { repeat: Infinity, ease: "linear", duration: 1 } : { duration: 0 }
          }}
          className="w-8 h-8 rounded-full bg-vault-card border border-white/10 shadow-lg flex items-center justify-center text-vault-green z-50"
        >
          <RefreshCw size={16} />
        </motion.div>
      </div>

      <motion.div
        drag={isAtTop ? "y" : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.4}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="min-h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

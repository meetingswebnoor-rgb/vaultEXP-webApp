'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

// Determine the depth of a route based on slash count
function getRouteDepth(path: string) {
  if (path === '/' || path === '/dashboard') return 0;
  return path.split('/').filter(Boolean).length;
}

const SWIPE_CONFIDENCE_THRESHOLD = 80;

export function MobileStackRouter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Keep track of route history to determine direction
  const [direction, setDirection] = useState(0);
  const prevDepthRef = useRef(getRouteDepth(pathname));
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      const currentDepth = getRouteDepth(pathname);
      const prevDepth = prevDepthRef.current;
      
      if (currentDepth > prevDepth) {
        setDirection(1); // Push (slide left)
      } else if (currentDepth < prevDepth) {
        setDirection(-1); // Pop (slide right)
      } else {
        setDirection(0); // Same level (fade or slide up)
      }

      prevDepthRef.current = currentDepth;
      prevPathRef.current = pathname;
    }
  }, [pathname]);

  const handleDragEnd = (e: any, info: PanInfo) => {
    // If swiped right past the threshold, go back
    if (info.offset.x > SWIPE_CONFIDENCE_THRESHOLD && info.velocity.x > 20) {
      router.back();
    }
  };

  const variants = {
    enter: (dir: number) => {
      if (dir === 1) return { x: '100%', opacity: 1, zIndex: 10 };
      if (dir === -1) return { x: '-30%', opacity: 0.5, zIndex: 0 };
      return { y: 20, opacity: 0, zIndex: 10 }; // Default fade for same-level tabs
    },
    center: {
      x: 0,
      y: 0,
      opacity: 1,
      zIndex: 10,
    },
    exit: (dir: number) => {
      if (dir === 1) return { x: '-30%', opacity: 0.5, zIndex: 0 };
      if (dir === -1) return { x: '100%', opacity: 1, zIndex: 10 };
      return { y: -20, opacity: 0, zIndex: 0 }; // Default fade for same-level tabs
    }
  };

  return (
    <AnimatePresence mode="popLayout" custom={direction} initial={false}>
      <motion.div
        key={pathname}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: 'spring', stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
          y: { duration: 0.2 }
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="relative w-full min-h-full bg-vault-darker overflow-x-hidden"
        style={{
          boxShadow: direction === -1 ? '-10px 0 30px rgba(0,0,0,0.5)' : 'none'
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

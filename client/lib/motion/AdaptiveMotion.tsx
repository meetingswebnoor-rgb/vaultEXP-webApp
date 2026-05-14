'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { GESTURES, TRANSITIONS } from './constants';

interface AdaptiveMotionProps extends HTMLMotionProps<'div'> {
  type: 'button' | 'card' | 'navItem' | 'none';
  children: React.ReactNode;
}

/**
 * AdaptiveMotion Wrapper
 * 
 * Automatically applies the correct hover/tap gestures based on device.
 * Prevents "hover states" from sticking on mobile devices.
 */
export function AdaptiveMotion({ 
  type, 
  children, 
  transition,
  ...props 
}: AdaptiveMotionProps) {
  const { isMobileOrTablet, isReady } = useBreakpoint();

  // Don't animate until client hydration is ready to avoid mismatch
  if (!isReady) return <div {...(props as any)}>{children}</div>;

  const gesture = type === 'none' ? {} : GESTURES[type](isMobileOrTablet);

  return (
    <motion.div
      {...gesture}
      transition={transition || TRANSITIONS.default}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * PageTransition Wrapper
 * 
 * Consistent entrance animation for all dashboard pages.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={TRANSITIONS.default}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

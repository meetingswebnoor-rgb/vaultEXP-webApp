/**
 * VaultEXP Unified Animation System
 * 
 * Centralised motion constants to ensure a consistent "premium feel"
 * across all devices while adapting to different input methods (touch vs mouse).
 */

export const EASING = [0.22, 1, 0.36, 1]; // Premium snappy cubic-bezier (Quart)
export const EASE_OUT = [0.25, 0.46, 0.45, 0.94]; // Fast ease out
export const SPRING = { type: 'spring', damping: 28, stiffness: 300 };
export const SPRING_BOUNCY = { type: 'spring', damping: 15, stiffness: 350 };

export const TRANSITIONS = {
  default: { duration: 0.25, ease: EASING },
  fast:    { duration: 0.18, ease: EASING },
  slow:    { duration: 0.4, ease: EASING },
  layout:  { type: 'spring', damping: 30, stiffness: 300, mass: 0.8 },
};

export const VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit:    { opacity: 0 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -10 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit:    { opacity: 0, scale: 0.95 },
  },
};

/**
 * ADAPTIVE GESTURES
 * 
 * Triggers differ by device:
 * Mobile: Tap-heavy, zero hover.
 * Desktop: Subtle hover, clean tap.
 */

export const GESTURES = {
  // Use for buttons and interactive items
  button: (isMobile: boolean) => ({
    whileTap: { scale: 0.96 },
    whileHover: isMobile ? {} : { scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' },
  }),
  
  // Use for cards and grid items
  card: (isMobile: boolean) => ({
    whileTap: { scale: 0.98 },
    whileHover: isMobile ? {} : { y: -4, borderColor: 'rgba(0,255,136,0.3)' },
  }),
  
  // Use for navigation links
  navItem: (isMobile: boolean) => ({
    whileTap: { scale: 0.95 },
    whileHover: isMobile ? {} : { x: 4, color: '#00FF88' },
  }),
};

'use client';

import { useState, useEffect } from 'react';

// ── Breakpoint Constants ──────────────────────────────────────
export const BREAKPOINTS = {
  MOBILE_MAX: 767,
  TABLET_MIN: 768,
  TABLET_MAX: 1024,
  DESKTOP_MIN: 1025,
} as const;

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface BreakpointState {
  width: number;
  device: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isMobileOrTablet: boolean;
  isReady: boolean; // false during SSR hydration
}

/**
 * useBreakpoint
 * Returns the current device type and boolean flags based on window width.
 * Safe for SSR — returns `isReady: false` until client hydration completes.
 */
export function useBreakpoint(): BreakpointState {
  const [state, setState] = useState<BreakpointState>({
    width: 0,
    device: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isMobileOrTablet: false,
    isReady: false,
  });

  useEffect(() => {
    function resolve(width: number): BreakpointState {
      const isMobile  = width <= BREAKPOINTS.MOBILE_MAX;
      const isTablet  = width >= BREAKPOINTS.TABLET_MIN && width <= BREAKPOINTS.TABLET_MAX;
      const isDesktop = width > BREAKPOINTS.TABLET_MAX;
      const device: DeviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

      return {
        width,
        device,
        isMobile,
        isTablet,
        isDesktop,
        isMobileOrTablet: isMobile || isTablet,
        isReady: true,
      };
    }

    // Set initial state
    setState(resolve(window.innerWidth));

    // Listen for resize with debounce
    let raf: ReturnType<typeof requestAnimationFrame>;
    const handleResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setState(resolve(window.innerWidth)));
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return state;
}

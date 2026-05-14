'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * ThemeProvider — Dynamic Visual Context
 * 
 * Synchronizes the application's visual state (theme, accent color)
 * with the user's settings from the AuthStore.
 * 
 * Features:
 *  - Dark/Light mode switching via [data-theme]
 *  - Custom accent colors via CSS variables
 *  - Instant application without reload
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  
  // Default values if settings not loaded
  const theme = user?.settings?.theme || 'dark';
  const accentColor = user?.settings?.accentColor || '#00FF88';

  useEffect(() => {
    const root = document.documentElement;
    
    // 1. Apply Theme
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.setAttribute('data-theme', 'dark');
    }

    // 2. Apply Accent Color
    root.style.setProperty('--color-accent', accentColor);
    
    // 3. Generate Glow Color (lower opacity version of accent)
    // Simple way to handle glow: use the accent color with opacity
    root.style.setProperty('--color-accent-glow', `${accentColor}40`); // Adding 40 for ~25% alpha

  }, [theme, accentColor]);

  return <>{children}</>;
}

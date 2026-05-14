import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

/**
 * Reusable Page Container
 * Standardizes max-width, horizontal/vertical padding, and responsive spacing
 * across all authenticated dashboard views.
 */
export function PageContainer({ 
  children, 
  className, 
  noPadding = false 
}: PageContainerProps) {
  return (
    <div 
      className={cn(
        // Max width and centering
        "w-full max-w-[1600px] mx-auto",
        // Responsive padding and spacing (adds extra bottom padding on mobile for BottomNav)
        !noPadding && "px-4 sm:px-6 md:px-8 pt-6 pb-28 md:pb-8 space-y-6",
        className
      )}
    >
      {children}
    </div>
  );
}

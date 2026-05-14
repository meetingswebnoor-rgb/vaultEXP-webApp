import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface ModuleCardProps {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
  className?: string;
  noPadding?: boolean;
}

/**
 * Standardized Module Card
 * Ensures consistent glassmorphism, border radius, and padding across all modules.
 */
export function ModuleCard({ children, title, action, className, noPadding = false }: ModuleCardProps) {
  return (
    <div className={cn(
      "w-full rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden",
      "shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all",
      className
    )}>
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.01]">
          {title && <h3 className="font-semibold text-white tracking-wide">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={cn(!noPadding && "p-6")}>
        {children}
      </div>
    </div>
  );
}

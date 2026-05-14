'use client';

/**
 * LayoutSkeleton
 * Rendered server-side and during hydration before useBreakpoint resolves.
 * Prevents layout flash and hydration mismatch.
 * Uses neutral structure that matches neither mobile nor desktop.
 */
export function LayoutSkeleton() {
  return (
    <div className="flex h-screen bg-vault-darker animate-pulse">
      {/* Sidebar placeholder (hidden on mobile via CSS) */}
      <div className="hidden lg:block w-60 h-full bg-vault-dark border-r border-vault-border flex-shrink-0" />

      <div className="flex-1 flex flex-col">
        {/* Header bar */}
        <div className="h-14 lg:h-16 border-b border-vault-border bg-vault-dark flex-shrink-0" />

        {/* Content skeleton */}
        <div className="flex-1 p-6 space-y-4">
          <div className="h-8 w-48 rounded-xl bg-vault-card" />
          <div className="h-4 w-72 rounded-lg bg-vault-card" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-vault-card border border-vault-border" />
            ))}
          </div>
        </div>

        {/* Bottom bar (shown only on mobile-ish sizes) */}
        <div className="lg:hidden h-16 border-t border-vault-border bg-vault-dark flex-shrink-0" />
      </div>
    </div>
  );
}

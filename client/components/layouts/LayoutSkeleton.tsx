'use client';

/**
 * LayoutSkeleton
 * Rendered during SSR / first hydration tick before useBreakpoint resolves.
 * Prevents layout flash and hydration mismatch.
 *
 * Uses inline styles as a guaranteed fallback so it renders dark correctly
 * even before Tailwind CSS variables have fully mounted.
 */
export function LayoutSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        backgroundColor: '#05050A',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar placeholder — only visible on desktop */}
      <div
        className="hidden lg:block"
        style={{
          width: '260px',
          height: '100%',
          backgroundColor: '#0A0F14',
          borderRight: '1px solid rgba(255,255,255,0.04)',
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar skeleton */}
        <div
          style={{
            height: '64px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            backgroundColor: '#0A0F14',
            flexShrink: 0,
          }}
        />

        {/* Content skeleton */}
        <div
          style={{
            flex: 1,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Title bar */}
          <div
            style={{
              height: '28px',
              width: '180px',
              borderRadius: '10px',
              backgroundColor: '#111118',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              height: '14px',
              width: '280px',
              borderRadius: '8px',
              backgroundColor: '#111118',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite 0.1s',
            }}
          />

          {/* Card grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '16px',
              marginTop: '8px',
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  height: '120px',
                  borderRadius: '20px',
                  backgroundColor: '#111118',
                  border: '1px solid rgba(255,255,255,0.04)',
                  animation: `skeleton-pulse 1.5s ease-in-out infinite ${i * 0.12}s`,
                }}
              />
            ))}
          </div>

          {/* Wide card */}
          <div
            style={{
              height: '200px',
              borderRadius: '20px',
              backgroundColor: '#111118',
              border: '1px solid rgba(255,255,255,0.04)',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite 0.3s',
            }}
          />
        </div>

        {/* Mobile bottom bar */}
        <div
          className="lg:hidden"
          style={{
            height: '64px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            backgroundColor: '#0A0F14',
            flexShrink: 0,
          }}
        />
      </div>

      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

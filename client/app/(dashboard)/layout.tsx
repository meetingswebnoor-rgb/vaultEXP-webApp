import type { Metadata } from 'next';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { AppShell } from '@/components/shell';

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | VaultEXP',
  },
  description: 'Your VaultEXP authenticated workspace.',
};

/**
 * (dashboard) Route Group Layout
 *
 * This layout wraps EVERY authenticated page in the application.
 * It is the single entry point for the App Shell system.
 *
 * Layer stack (outermost → innermost):
 *   RootLayout (app/layout.tsx)
 *     └─ AuthGuard          — validates session, redirects if unauthenticated
 *         └─ AppShell       — mounts shell context + responsive layout dispatcher
 *             └─ {children} — individual page content
 *
 * Why a route group?
 *   Using (dashboard) keeps this layout namespace-isolated from the public
 *   marketing routes (/) and auth routes (/auth/*), so adding new authenticated
 *   routes here never affects the public layout, and vice-versa.
 */
export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}

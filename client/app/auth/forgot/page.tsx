'use client';

import { useBreakpoint } from '@/hooks/useBreakpoint';
import { AuthLayout as MobileAuthLayout } from '@/components/mobile/auth/AuthLayout';
import { DesktopAuthLayout } from '@/components/desktop/auth/DesktopAuthLayout';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const { isDesktop, isReady } = useBreakpoint();

  if (!isReady) return <div className="min-h-screen bg-vault-darker" />;

  const title = "Recover Account";
  const subtitle = "Enter your email to receive a reset link";

  if (isDesktop) {
    return (
      <DesktopAuthLayout title={title} subtitle={subtitle}>
        <ForgotPasswordForm />
      </DesktopAuthLayout>
    );
  }

  return (
    <MobileAuthLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">{title}</h1>
          <p className="text-gray-500 mt-2 text-sm">{subtitle}</p>
        </div>
        <div className="glass-card-mobile p-6">
          <ForgotPasswordForm />
        </div>
      </div>
    </MobileAuthLayout>
  );
}

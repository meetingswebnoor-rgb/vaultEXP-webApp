'use client';

import { useBreakpoint } from '@/hooks/useBreakpoint';
import { AuthLayout as MobileAuthLayout } from '@/components/mobile/auth/AuthLayout';
import { DesktopAuthLayout } from '@/components/desktop/auth/DesktopAuthLayout';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Suspense } from 'react';

function ResetPasswordContent() {
  const { isDesktop, isReady } = useBreakpoint();

  if (!isReady) return <div className="min-h-screen bg-vault-darker" />;

  const title = "New Password";
  const subtitle = "Secure your vault with a fresh credential";

  if (isDesktop) {
    return (
      <DesktopAuthLayout title={title} subtitle={subtitle}>
        <ResetPasswordForm />
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
          <ResetPasswordForm />
        </div>
      </div>
    </MobileAuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-vault-darker" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

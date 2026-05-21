'use client';

import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { UnifiedAuthLayout } from '@/components/auth/UnifiedAuthLayout';

function ResetPasswordContent() {
  const title = "New Password";
  const subtitle = "Secure your vault with a fresh credential";

  return (
    <UnifiedAuthLayout mode="reset">
      <div className="auth-heading-desktop">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'Outfit, Inter, sans-serif', margin: '0 0 4px' }}>{title}</h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>{subtitle}</p>
      </div>
      
      <ResetPasswordForm />
    </UnifiedAuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#05050A]" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

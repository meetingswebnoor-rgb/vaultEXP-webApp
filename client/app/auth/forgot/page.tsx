'use client';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { UnifiedAuthLayout } from '@/components/auth/UnifiedAuthLayout';

export default function ForgotPasswordPage() {
  const title = "Recover Account";
  const subtitle = "Enter your email to receive a reset link";

  return (
    <UnifiedAuthLayout mode="forgot">
      <div className="auth-heading-desktop">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'Outfit, Inter, sans-serif', margin: '0 0 4px' }}>{title}</h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>{subtitle}</p>
      </div>
      
      <ForgotPasswordForm />
    </UnifiedAuthLayout>
  );
}

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthLoginForm } from '@/components/auth/AuthForms';

export const metadata: Metadata = {
  title: 'Sign In | VaultEXP',
  description: 'Sign in to your VaultEXP account to manage your digital assets.',
};

export default function LoginPage() {
  return <AuthLoginForm />;
}

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthSignupForm } from '@/components/auth/AuthForms';

export const metadata: Metadata = {
  title: 'Create Account | VaultEXP',
  description: 'Create your VaultEXP account and start managing your digital empire.',
};

export default function SignupPage() {
  return <AuthSignupForm />;
}

'use client';

import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { UnifiedAuthLayout } from '@/components/auth/UnifiedAuthLayout';
import { motion } from 'framer-motion';

function ResetPasswordContent() {
  const title = "New Password";
  const subtitle = "Secure your vault with a fresh credential";

  return (
    <UnifiedAuthLayout mode="reset">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="auth-heading-desktop text-center mb-6">
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', fontFamily: 'Outfit, Inter, sans-serif', margin: '0 0 8px', letterSpacing: '-0.02em' }}>{title}</h1>
        <p style={{ fontSize: 14, color: '#9CA3AF', margin: 0 }}>{subtitle}</p>
      </motion.div>
      
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

'use client';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { UnifiedAuthLayout } from '@/components/auth/UnifiedAuthLayout';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const title = "Recover Account";
  const subtitle = "Enter your email to receive a reset link";

  return (
    <UnifiedAuthLayout mode="forgot">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="auth-heading-desktop text-center mb-6">
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', fontFamily: 'Outfit, Inter, sans-serif', margin: '0 0 8px', letterSpacing: '-0.02em' }}>{title}</h1>
        <p style={{ fontSize: 14, color: '#9CA3AF', margin: 0 }}>{subtitle}</p>
      </motion.div>
      
      <ForgotPasswordForm />
    </UnifiedAuthLayout>
  );
}

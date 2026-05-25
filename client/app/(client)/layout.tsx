import { ReactNode } from 'react';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { ClientShell } from '@/components/shell/ClientShell';

export const metadata = {
  title: 'Client Portal | VaultEXP',
  description: 'Secure client document and billing portal.',
};

export default function ClientGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard fallbackUrl="/client/login">
      <RoleGuard minimumClearance={3} loginUrl="/client/login">
        <ClientShell>{children}</ClientShell>
      </RoleGuard>
    </AuthGuard>
  );
}

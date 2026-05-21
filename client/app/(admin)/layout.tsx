import { ReactNode } from 'react';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { AdminShell } from '@/components/shell/AdminShell';

export const metadata = {
  title: 'Super Admin Portal | VaultEXP',
  description: 'Enterprise administrative command center.',
};

export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard fallbackUrl="/admin/login">
      <RoleGuard minimumClearance={3} loginUrl="/admin/login">
        <AdminShell>{children}</AdminShell>
      </RoleGuard>
    </AuthGuard>
  );
}

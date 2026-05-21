import { ReactNode } from 'react';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function AppDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['business_owner', 'TEAM_MEMBER', 'SUPER_ADMIN', 'ADMIN', 'USER']} loginUrl="/auth/login">
      {children}
    </RoleGuard>
  );
}

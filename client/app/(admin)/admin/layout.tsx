import { ReactNode } from 'react';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function AdminRouteLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard minimumClearance={3} loginUrl="/admin/login">
      {children}
    </RoleGuard>
  );
}

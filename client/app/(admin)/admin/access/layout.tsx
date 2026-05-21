import { RoleGuard } from '@/components/guards/RoleGuard';
import { ReactNode } from 'react';

export default function AccessControlLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard minimumClearance={4} loginUrl="/admin/login">
      {children}
    </RoleGuard>
  );
}

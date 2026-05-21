import { ReactNode } from 'react';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function ClientRouteLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard minimumClearance={2} loginUrl="/client/login">
      {children}
    </RoleGuard>
  );
}

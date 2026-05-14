'use client';

import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { ModuleCard } from '@/components/ui/ModuleCard';
import useAuth from '@/src/store/useAuth';
import { LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <PageContainer>
      <PageHeader 
        title="Profile & Settings" 
        description="Manage your personal information and preferences." 
      />
      <ModuleCard className="p-8 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-2xl bg-vault-green/10 border border-vault-green/20 flex items-center justify-center text-3xl font-bold text-vault-green">
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.name || 'User'}</h2>
            <p className="text-white/40">{user?.email || 'No email connected'}</p>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all font-semibold"
          >
            <LogOut size={18} />
            Sign Out from Vault
          </button>
        </div>
      </ModuleCard>
    </PageContainer>
  );
}

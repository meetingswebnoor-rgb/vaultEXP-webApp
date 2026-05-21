'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ShieldAlert, Database, Cpu, Calendar, UserCheck, UserX, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserDetail() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminUser', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}`);
      return res.data.data;
    }
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => api.patch(`/admin/users/${userId}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUser', userId] })
  });

  const verifyUser = useMutation({
    mutationFn: async (isVerified: boolean) => api.patch(`/admin/users/${userId}/verify`, { isVerified }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUser', userId] })
  });

  if (isLoading) return <div className="p-8 text-gray-400">Loading user profile...</div>;
  if (!data) return <div className="p-8 text-red-400">User not found.</div>;

  const { user, stats } = data;
  const activeSub = stats.activeSubscription;
  const maxStorage = activeSub?.plan?.maxStorage || 5120; // Default Free: 5GB (5120MB)
  const maxAiTokens = activeSub?.plan?.maxAiTokens || 100000;
  
  const storageMB = stats.totalStorageBytes / (1024 * 1024);
  const storagePercent = Math.min((storageMB / maxStorage) * 100, 100);
  
  const aiTokensUsed = activeSub ? activeSub.aiTokensUsed : (user.aiProfile?.tokensUsed || 0);
  const aiTokensPercent = Math.min((aiTokensUsed / maxAiTokens) * 100, 100);

  return (
    <div className="p-8 max-w-5xl mx-auto pb-32">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-vault-green/20 to-vault-green/5 flex items-center justify-center text-vault-green font-bold text-2xl border border-vault-green/20">
            {user.name?.[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-white">{user.name}</h1>
              {user.isVerified && <UserCheck className="text-blue-400" size={20} />}
            </div>
            <p className="text-gray-400">{user.email} • ID: {user.id}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => verifyUser.mutate(!user.isVerified)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors text-sm"
          >
            {user.isVerified ? 'Remove Verification' : 'Verify Identity'}
          </button>
          
          <button 
            onClick={() => updateStatus.mutate(user.status === 'active' ? 'suspended' : 'active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              user.status === 'active' ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-vault-green/10 text-vault-green hover:bg-vault-green/20'
            }`}
          >
            {user.status === 'active' ? 'Suspend User' : 'Restore User'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <Database size={18} className="text-vault-green" /> Storage Quota
          </h3>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-400">Used: {storageMB.toFixed(2)} MB</span>
            <span className="text-white font-bold">{maxStorage} MB</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-3 mb-1 overflow-hidden">
            <div className="bg-vault-green h-3 rounded-full" style={{ width: `${storagePercent}%` }} />
          </div>
          <p className="text-xs text-gray-500 text-right">{storagePercent.toFixed(1)}% of limit</p>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <Cpu size={18} className="text-purple-400" /> AI Intelligence Tokens
          </h3>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-400">Used: {aiTokensUsed.toLocaleString()}</span>
            <span className="text-white font-bold">{maxAiTokens.toLocaleString()}</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-3 mb-1 overflow-hidden">
            <div className="bg-purple-400 h-3 rounded-full" style={{ width: `${aiTokensPercent}%` }} />
          </div>
          <p className="text-xs text-gray-500 text-right">{aiTokensPercent.toFixed(1)}% of monthly limit</p>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-bold text-white mb-4">Enterprise Workspaces</h3>
        {user.workspaceMembers.length === 0 ? (
          <p className="text-gray-500 text-sm">User is not a member of any workspaces.</p>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {user.workspaceMembers.map((wm: any) => (
              <div key={wm.workspaceId} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-white">{wm.workspace.name}</p>
                  <p className="text-xs text-gray-400">Joined {new Date(wm.joinedAt).toLocaleDateString()}</p>
                </div>
                <span className="px-2.5 py-1 bg-white/5 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-300">
                  {wm.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {user.status === 'suspended' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle className="text-red-500 mt-1" size={24} />
          <div>
            <h3 className="text-red-500 font-bold text-lg">Account Suspended</h3>
            <p className="text-red-400/80 mt-1 text-sm">
              This user has been suspended and all platform access is currently revoked. AI jobs, API keys, and workspace access are completely locked.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

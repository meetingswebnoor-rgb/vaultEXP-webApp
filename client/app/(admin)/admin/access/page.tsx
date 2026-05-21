'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Shield, Check, X, ShieldAlert, ArrowUpRight, UserX, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function AccessControlDashboard() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['adminAccessUsers'],
    queryFn: async () => {
      const res = await api.get('/admin/access/users');
      return res.data.data;
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/admin/access/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminAccessUsers'] })
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role, clearanceLevel }: any) => api.patch(`/admin/access/${id}/role`, { role, clearanceLevel }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminAccessUsers'] })
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, isActive, status }: any) => api.patch(`/admin/access/${id}/status`, { isActive, status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminAccessUsers'] })
  });

  if (isLoading) {
    return <div className="p-8 text-gray-400">Loading access control matrix...</div>;
  }

  const users = usersData || [];
  const pendingUsers = users.filter((u: any) => !u.isApproved);
  const activeUsers = users.filter((u: any) => u.isApproved);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Shield className="text-vault-green" /> Access Control & Approvals
        </h1>
        <p className="text-gray-400 mt-2">Manage clearances, approve administrative accounts, and enforce global RBAC boundaries.</p>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <ShieldAlert className="text-yellow-500" /> Pending Approvals ({pendingUsers.length})
        </h2>
        {pendingUsers.length === 0 ? (
          <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-gray-500 text-sm">
            No pending approvals.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingUsers.map((user: any) => (
              <div key={user.id} className="p-6 bg-white/[0.02] border border-yellow-500/20 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold">{user.name}</h3>
                  <p className="text-sm text-gray-400">{user.email}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded">
                    Requested Role: {user.role}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => approveMutation.mutate(user.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-vault-green text-black font-bold text-sm rounded-xl hover:bg-[#00cc6a] transition-colors"
                  >
                    <Check size={16} /> Approve
                  </button>
                  <button 
                    onClick={() => statusMutation.mutate({ id: user.id, isActive: false, status: 'suspended' })}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-300 font-bold text-sm rounded-xl hover:bg-red-500/20 hover:text-red-500 transition-colors border border-white/10 hover:border-red-500/20"
                  >
                    <X size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-6">Clearance Roster</h2>
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] border-b border-white/[0.05] text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Clearance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {activeUsers.map((user: any) => (
                <tr key={user.id} className="hover:bg-white/[0.01]">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-white/10 text-gray-300 text-xs font-bold rounded">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-vault-green text-sm font-bold">Level {user.clearanceLevel}</span>
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <span className="text-vault-green text-xs font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-vault-green inline-block"/> Active</span>
                    ) : (
                      <span className="text-red-500 text-xs font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/> Suspended</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.role !== 'SUPER_ADMIN' && (
                        <select 
                          className="bg-black/50 border border-white/10 text-white text-xs rounded px-2 py-1"
                          value={user.role}
                          onChange={(e) => {
                            let cl = 1;
                            if(e.target.value === 'CLIENT') cl = 2;
                            if(e.target.value === 'ADMIN') cl = 3;
                            roleMutation.mutate({ id: user.id, role: e.target.value, clearanceLevel: cl });
                          }}
                        >
                          <option value="USER">USER</option>
                          <option value="CLIENT">CLIENT</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      )}
                      {user.role !== 'SUPER_ADMIN' && user.isActive && (
                        <button 
                          onClick={() => statusMutation.mutate({ id: user.id, isActive: false, status: 'suspended' })}
                          className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"
                        >
                          <UserX size={14} />
                        </button>
                      )}
                      {user.role !== 'SUPER_ADMIN' && !user.isActive && (
                        <button 
                          onClick={() => statusMutation.mutate({ id: user.id, isActive: true, status: 'active' })}
                          className="p-1.5 bg-vault-green/10 text-vault-green rounded hover:bg-vault-green/20"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

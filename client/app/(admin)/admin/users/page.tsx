'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, Shield, UserX, UserCheck, MoreVertical, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AdminUsersDashboard() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', search, statusFilter],
    queryFn: async () => {
      let url = '/admin/users?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      const res = await api.get(url);
      return res.data.data;
    }
  });

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">User Administration</h1>
        <p className="text-gray-400 mt-2">Manage global users, verify accounts, and enforce platform limits.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-vault-green/50 transition-colors"
          />
        </div>
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2 text-white focus:outline-none appearance-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.02] border-b border-white/[0.05]">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-400">User</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Role</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Plan</th>
                <th className="px-6 py-4 font-semibold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading users...</td>
                </tr>
              ) : data?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                data?.map((user: any) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300 font-bold border border-white/10">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/admin/users/${user.id}`} className="font-semibold text-white hover:text-vault-green transition-colors flex items-center gap-2">
                            {user.name}
                            {user.isVerified && <UserCheck size={14} className="text-blue-400" />}
                          </Link>
                          <div className="text-gray-400 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.status === 'active' ? 'bg-vault-green/10 text-vault-green' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? <ShieldAlert size={14} className="text-yellow-500" /> : <Shield size={14} className="text-gray-500" />}
                        <span className="text-gray-300 capitalize">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.subscriptions && user.subscriptions.length > 0 ? (
                        <span className="text-purple-400 font-medium">
                          {user.subscriptions[0].plan?.name || 'Unknown Plan'}
                        </span>
                      ) : (
                        <span className="text-gray-500">Free Tier</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/users/${user.id}`} 
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold transition-colors inline-block"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

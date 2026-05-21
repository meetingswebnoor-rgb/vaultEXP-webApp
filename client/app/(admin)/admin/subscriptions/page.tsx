'use client';

import { useAdminSubscriptions } from '@/hooks/useAdmin';
import { CreditCard, Repeat, AlertTriangle } from 'lucide-react';

export default function AdminSubscriptionsPage() {
  const { data, isLoading } = useAdminSubscriptions();

  if (isLoading) return <div className="p-8 text-white">Loading Subscriptions...</div>;

  const subscriptions = data?.data || [];

  return (
    <div className="p-8 pb-32">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SaaS Subscriptions</h1>
          <p className="text-gray-400 mt-2">Global billing and subscription management.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Active Plans</h3>
            <div className="p-2 bg-vault-green/10 text-vault-green rounded-xl"><Repeat size={18} /></div>
          </div>
          <p className="text-3xl font-bold text-white">{subscriptions.filter((s:any)=>s.status==='ACTIVE').length}</p>
        </div>
        <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Past Due</h3>
            <div className="p-2 bg-red-500/10 text-red-400 rounded-xl"><AlertTriangle size={18} /></div>
          </div>
          <p className="text-3xl font-bold text-white">{subscriptions.filter((s:any)=>s.status==='PAST_DUE').length}</p>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.05]">
              <th className="p-4 text-sm font-medium text-gray-400">Plan Name</th>
              <th className="p-4 text-sm font-medium text-gray-400">Amount</th>
              <th className="p-4 text-sm font-medium text-gray-400">Interval</th>
              <th className="p-4 text-sm font-medium text-gray-400">Status</th>
              <th className="p-4 text-sm font-medium text-gray-400">Next Billing</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No subscriptions found.</td></tr>
            )}
            {subscriptions.map((s: any) => (
              <tr key={s.id} className="border-b border-white/[0.02] hover:bg-white/[0.01]">
                <td className="p-4 text-white font-medium">{s.planName}</td>
                <td className="p-4 text-gray-300">${s.amount} {s.currency}</td>
                <td className="p-4 text-gray-400">{s.interval}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    s.status === 'ACTIVE' ? 'bg-vault-green/10 text-vault-green' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="p-4 text-gray-400">{new Date(s.nextBillingDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

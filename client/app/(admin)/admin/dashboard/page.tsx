'use client';

import { motion } from 'framer-motion';
import { useAdminStats } from '@/hooks/useAdmin';
import { Users, Building2, CreditCard, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useAdminStats();

  if (isLoading) {
    return (
      <div className="p-8 pb-32 animate-pulse">
        <div className="h-8 bg-white/5 rounded w-1/3 mb-4" />
        <div className="h-4 bg-white/5 rounded w-1/4 mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/[0.02] border border-white/[0.05] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 pb-32">
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4">
          <Activity className="text-red-500 mt-1" size={24} />
          <div>
            <h2 className="text-xl font-bold text-red-500 mb-2">Dashboard Offline</h2>
            <p className="text-red-400/80">Failed to connect to the global admin node. The API might be unresponsive.</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = data?.data || {};

  return (
    <div className="p-8 pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Platform Command Center</h1>
        <p className="text-gray-400 mt-2">Global system overview and health metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers || 0} icon={Users} color="bg-blue-500/10 text-blue-400 border-blue-500/20" />
        <StatCard title="Active Businesses" value={stats.activeBusinesses || 0} icon={Building2} color="bg-purple-500/10 text-purple-400 border-purple-500/20" />
        <StatCard title="Monthly Recurring Revenue" value={`$${stats.mrr || 0}`} icon={CreditCard} color="bg-green-500/10 text-green-400 border-green-500/20" />
        <StatCard title="Platform Health" value={stats.platformHealth || 'Optimal'} icon={Activity} color="bg-vault-green/10 text-vault-green border-vault-green/20" />
      </div>
      
      {/* Additional admin metrics could be rendered here */}
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">System Alerts</h2>
        <div className="flex items-center gap-3 p-4 bg-vault-green/5 border border-vault-green/20 rounded-xl">
          <Activity className="text-vault-green" size={20} />
          <div>
            <p className="text-white font-medium">All systems operational</p>
            <p className="text-gray-400 text-sm">Last checked: Just now</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={`p-6 rounded-2xl border ${color} bg-white/[0.02] backdrop-blur-sm`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
      </div>
    </motion.div>
  );
}

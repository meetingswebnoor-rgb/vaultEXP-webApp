'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Database, Cpu, DollarSign, Users, AlertCircle, HardDrive } from 'lucide-react';

export default function AnalyticsDashboard() {
  const { data: analyticsData, isLoading: isLoadingAnalytics, isError: isErrorAnalytics } = useQuery({
    queryKey: ['platformAnalytics'],
    queryFn: async () => {
      const res = await api.get('/api/admin/analytics');
      return res.data.data;
    },
    refetchInterval: 60000 // Refetch every minute
  });

  const { data: healthData, isLoading: isLoadingHealth } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      const res = await api.get('/api/admin/monitoring/health');
      return res.data.data;
    },
    refetchInterval: 10000 // Fast refetch for system health (10s)
  });

  if (isLoadingAnalytics || isLoadingHealth) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full pb-32 animate-pulse">
        <div className="h-8 bg-white/5 rounded w-1/4 mb-4" />
        <div className="h-4 bg-white/5 rounded w-1/3 mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/[0.02] border border-white/[0.05] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (isErrorAnalytics || !analyticsData) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full pb-32">
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4">
          <AlertCircle className="text-red-500 mt-1" size={24} />
          <div>
            <h2 className="text-xl font-bold text-red-500 mb-2">Analytics System Offline</h2>
            <p className="text-red-400/80">Failed to retrieve enterprise metrics. The analytics engine might be experiencing downtime or the query failed.</p>
          </div>
        </div>
      </div>
    );
  }

  const { metrics = { activeUsers: 0, mrr: 0, totalAiTokens: 0, totalStorageBytes: 0 }, timeSeries = [] } = analyticsData;
  const health = healthData;

  const storageGB = (metrics.totalStorageBytes / (1024 * 1024 * 1024)).toFixed(2);
  const memoryMB = health ? health.memoryUsageMB : '0';

  return (
    <div className="p-8 max-w-7xl mx-auto w-full pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Platform Analytics</h1>
        <p className="text-gray-400 mt-2">Mission control for SaaS revenue, global AI usage, and system health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Monthly Revenue" value={`$${metrics.mrr.toLocaleString()}`} icon={DollarSign} color="text-vault-green" bg="bg-vault-green/10" />
        <MetricCard title="Total Users" value={metrics.activeUsers.toLocaleString()} icon={Users} color="text-blue-400" bg="bg-blue-400/10" />
        <MetricCard title="Global AI Tokens" value={metrics.totalAiTokens.toLocaleString()} icon={Cpu} color="text-purple-400" bg="bg-purple-400/10" />
        <MetricCard title="Secure Storage" value={`${storageGB} GB`} icon={HardDrive} color="text-orange-400" bg="bg-orange-400/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Revenue Growth (7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CDFF73" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#CDFF73" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#666" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#CDFF73', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#CDFF73" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Daily API Usage</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#666" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="aiRequests" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="text-blue-400" size={20} /> System Health & Monitoring
        </h3>
        
        {health && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${health.status === 'online' ? 'bg-vault-green animate-pulse' : 'bg-red-500'}`} />
                <span className="text-white font-bold capitalize">{health.status}</span>
              </div>
            </div>
            
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Memory (RSS)</p>
              <p className="text-2xl font-bold text-white">{memoryMB} <span className="text-sm font-normal text-gray-500">MB</span></p>
            </div>
            
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">CPU Load</p>
              <p className="text-2xl font-bold text-white">{health.cpuLoad}</p>
            </div>

            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Errors (500s)</p>
              <div className="flex items-center gap-2">
                <AlertCircle className={health.errorRates?.['500'] > 0 ? 'text-red-500' : 'text-vault-green'} size={20} />
                <p className="text-2xl font-bold text-white">{health.errorRates?.['500'] || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
      </div>
    </div>
  );
}

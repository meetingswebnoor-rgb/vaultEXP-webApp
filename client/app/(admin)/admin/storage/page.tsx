'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Database, HardDrive, Files, Lock, Zap, Server, Shield, Activity } from 'lucide-react';

export default function StorageDashboard() {
  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['storageMetrics'],
    queryFn: async () => {
      const res = await api.get('/api/admin/storage/metrics');
      return res.data.data;
    }
  });

  const { data: providersData, isLoading: providersLoading } = useQuery({
    queryKey: ['storageProviders'],
    queryFn: async () => {
      const res = await api.get('/api/admin/storage/providers');
      return res.data.data;
    }
  });

  if (metricsLoading || providersLoading) {
    return <div className="p-8 text-gray-400">Loading infrastructure telemetry...</div>;
  }

  const { totalBytes, documentCount, encryptedCount, estimatedCostUsd, aiQueueSize, timeSeries } = metricsData;
  const providers = providersData || [];

  // Convert bytes to GB for display
  const totalGB = (totalBytes / (1024 ** 3)).toFixed(2);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Database className="text-blue-500" /> Storage Infrastructure
        </h1>
        <p className="text-gray-400 mt-2">Enterprise command center for global cloud storage, upload bandwidth, and AI processing queues.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Global Storage Used" value={`${totalGB} GB`} icon={HardDrive} color="text-blue-500" bg="bg-blue-500/10" />
        <MetricCard title="Total Documents" value={documentCount.toLocaleString()} icon={Files} color="text-purple-400" bg="bg-purple-400/10" />
        <MetricCard title="Zero-Knowledge Encrypted" value={encryptedCount.toLocaleString()} icon={Lock} color="text-vault-green" bg="bg-vault-green/10" />
        <MetricCard title="AI Processing Queue" value={`${aiQueueSize} Docs`} icon={Zap} color="text-yellow-400" bg="bg-yellow-400/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Upload Bandwidth Chart */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Daily Upload Volume (30 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries}>
                <defs>
                  <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#666" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}MB`} width={60} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                  formatter={(value: any) => [`${value} MB`, 'Upload Bandwidth']}
                />
                <Area type="monotone" dataKey="uploadVolMB" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUploads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Infrastructure Nodes */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Server className="text-gray-400" size={20} /> Storage Nodes
          </h3>
          
          <div className="space-y-4 flex-1">
            {providers.map((node: any) => (
              <NodeRow key={node.id} name={node.name} type={node.type} status={node.status} usage={node.usageGB} />
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-sm font-bold text-gray-400 mb-3">Cost Estimation</h4>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">AWS S3 Billing (Est.)</span>
                <span className="font-mono text-white font-bold">${estimatedCostUsd.toFixed(2)} / mo</span>
              </div>
              <p className="text-xs text-gray-500">Based on standard $0.023/GB pricing tier. Excludes egress bandwidth.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-2 rounded-xl ${bg} ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-gray-400 text-sm font-medium mb-1 relative z-10">{title}</p>
      <p className="text-3xl font-bold text-white relative z-10">{value}</p>
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] rounded-full ${bg} opacity-50 group-hover:opacity-100 transition-opacity`} />
    </div>
  );
}

function NodeRow({ name, type, status, usage }: any) {
  const isActive = status === 'Active';
  return (
    <div className="flex flex-col bg-white/5 border border-white/10 p-4 rounded-xl gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-gray-500'}`} />
          <div>
            <p className="text-sm font-bold text-white">{name}</p>
            <p className="text-xs text-gray-400">{type}</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-400' : 'text-gray-400'}`}>
          {status}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (usage / 1000) * 100)}%` }} />
        </div>
        <span className="text-xs text-gray-400 font-mono">{usage} GB</span>
      </div>
    </div>
  );
}

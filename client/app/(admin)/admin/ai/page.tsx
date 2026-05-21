'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Cpu, DollarSign, Activity, Settings2, Zap, Power } from 'lucide-react';
import { useState } from 'react';

export default function AIOperationsDashboard() {
  const queryClient = useQueryClient();
  const [configLoading, setConfigLoading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['aiMetrics'],
    queryFn: async () => {
      const res = await api.get('/admin/ai/metrics');
      return res.data.data;
    },
    refetchInterval: 30000
  });

  const updateConfig = useMutation({
    mutationFn: async (providers: any) => {
      setConfigLoading(true);
      return api.patch('/admin/ai/config', { providers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiMetrics'] });
      setConfigLoading(false);
    },
    onError: () => setConfigLoading(false)
  });

  if (isLoading) {
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

  if (isError || !data) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full pb-32">
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4">
          <Activity className="text-red-500 mt-1" size={24} />
          <div>
            <h2 className="text-xl font-bold text-red-500 mb-2">AI Telemetry Offline</h2>
            <p className="text-red-400/80">Failed to connect to the AI command center. The metrics API might be unresponsive.</p>
          </div>
        </div>
      </div>
    );
  }

  const { totalTokens = 0, estimatedCostUsd = 0, activeModels = 0, failureRate = '0%', timeSeries = [], config = { providers: {} } } = data;

  const handleToggleProvider = (provider: string, currentStatus: boolean) => {
    updateConfig.mutate({
      [provider]: { ...config.providers[provider], enabled: !currentStatus }
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Cpu className="text-purple-400" /> AI Operations Center
        </h1>
        <p className="text-gray-400 mt-2">Global command center for AI performance, token telemetry, and provider management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Tokens Burned" value={totalTokens.toLocaleString()} icon={Zap} color="text-yellow-400" bg="bg-yellow-400/10" />
        <MetricCard title="Est. Platform Cost" value={`$${estimatedCostUsd.toFixed(2)}`} icon={DollarSign} color="text-red-400" bg="bg-red-400/10" />
        <MetricCard title="Active Models" value={activeModels.toString()} icon={Settings2} color="text-blue-400" bg="bg-blue-400/10" />
        <MetricCard title="Failure Rate" value={failureRate} icon={Activity} color="text-vault-green" bg="bg-vault-green/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Token Burn Rate Chart */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Global Token Burn Rate (7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#666" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#a855f7', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="tokens" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorTokens)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Provider Controls */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Settings2 className="text-gray-400" size={20} /> Provider Master Controls
          </h3>
          
          <div className="space-y-4 relative">
            {configLoading && (
              <div className="absolute inset-0 bg-[#0A0F14]/50 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center">
                <span className="text-vault-green text-sm font-bold animate-pulse">Syncing Network...</span>
              </div>
            )}
            
            {Object.entries(config.providers).map(([key, provider]: [string, any]) => (
              <div key={key} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold capitalize">{key}</h4>
                  <p className="text-xs text-gray-400">{provider.model}</p>
                </div>
                
                <button
                  onClick={() => handleToggleProvider(key, provider.enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    provider.enabled ? 'bg-vault-green' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      provider.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
            
            <div className="pt-4 mt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 leading-relaxed">
                Disabling a provider will instantly route traffic to fallback models or gracefully degrade AI features globally. Use with extreme caution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-xl ${bg} ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

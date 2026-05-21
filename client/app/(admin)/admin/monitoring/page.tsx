'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Activity, Server, Cpu, Database, AlertCircle, CheckCircle2, Zap, Wifi } from 'lucide-react';

export default function PlatformHealthDashboard() {
  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      const res = await api.get('/api/admin/monitoring/health');
      return res.data.data;
    },
    refetchInterval: 5000 // Poll every 5s for realtime feel
  });

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['serviceLatency'],
    queryFn: async () => {
      const res = await api.get('/api/admin/monitoring/services');
      return res.data.data;
    },
    refetchInterval: 5000
  });

  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['systemAlerts'],
    queryFn: async () => {
      const res = await api.get('/api/admin/monitoring/alerts');
      return res.data.data;
    },
    refetchInterval: 15000
  });

  if (healthLoading || servicesLoading) {
    return <div className="p-8 text-gray-400">Connecting to telemetry nodes...</div>;
  }

  const { memoryUsageMB, cpuLoad, failedJobs, websocketHealth, uptime } = healthData;
  const services = servicesData || [];
  const alerts = alertsData || [];

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full pb-32">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Activity className="text-vault-green" /> Platform Health
          </h1>
          <p className="text-gray-400 mt-2">Real-time DevOps telemetry, latency monitoring, and incident alerting.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400 font-mono bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <Wifi size={14} className="text-vault-green animate-pulse" /> Live Telemetry Active
        </div>
      </div>

      {/* DevOps Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard title="CPU Load Avg" value={`${cpuLoad}%`} icon={Cpu} color={parseFloat(cpuLoad) > 80 ? 'text-red-500' : 'text-blue-400'} bg={parseFloat(cpuLoad) > 80 ? 'bg-red-500/10' : 'bg-blue-400/10'} />
        <MetricCard title="Memory (Heap)" value={`${memoryUsageMB} MB`} icon={Server} color="text-purple-400" bg="bg-purple-400/10" />
        <MetricCard title="Failed Queue Jobs" value={failedJobs} icon={AlertCircle} color={failedJobs > 0 ? 'text-orange-400' : 'text-vault-green'} bg={failedJobs > 0 ? 'bg-orange-400/10' : 'bg-vault-green/10'} />
        <MetricCard title="System Uptime" value={formatUptime(uptime)} icon={Zap} color="text-vault-green" bg="bg-vault-green/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latency Matrix */}
        <div className="bg-[#0A0F14] border border-white/[0.05] rounded-2xl p-6 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Database className="text-gray-400" size={20} /> Service Latency Matrix
          </h3>
          <div className="space-y-5">
            {services.map((service: any) => {
              // Color coding based on latency thresholds
              const isWarning = service.latency > 150 && service.latency < 500;
              const isCritical = service.latency >= 500;
              
              let barColor = 'bg-vault-green';
              let textColor = 'text-vault-green';
              
              if (isWarning) { barColor = 'bg-orange-400'; textColor = 'text-orange-400'; }
              if (isCritical) { barColor = 'bg-red-500'; textColor = 'text-red-500'; }

              // Normalize width: cap at 1000ms for visual scale
              const normalizedWidth = Math.min((service.latency / 1000) * 100, 100);

              return (
                <div key={service.service} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{service.service}</span>
                    <span className={`text-xs font-mono font-bold ${textColor}`}>{service.latency} ms</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${barColor} transition-all duration-1000 ease-in-out`}
                      style={{ width: `${Math.max(normalizedWidth, 2)}%` }} // At least 2% to be visible
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Incident Alerts */}
        <div className="bg-[#0A0F14] border border-white/[0.05] rounded-2xl flex flex-col shadow-2xl">
          <div className="p-6 border-b border-white/[0.05]">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="text-gray-400" size={20} /> Active Incidents & Alerts
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {alertsLoading ? (
              <div className="p-4 text-center text-gray-500">Scanning for incidents...</div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <CheckCircle2 className="text-vault-green mb-2" size={32} />
                <p className="text-vault-green font-bold">All Systems Nominal</p>
                <p className="text-gray-500 text-sm mt-1">No active incidents detected.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {alerts.map((alert: any) => (
                  <div key={alert.id} className="flex gap-4 p-4 hover:bg-white/[0.02] rounded-xl transition-colors">
                    <div className="mt-0.5">
                      {alert.severity === 'critical' ? <AlertCircle className="text-red-500" size={18} /> :
                       alert.severity === 'warning' ? <AlertCircle className="text-orange-400" size={18} /> :
                       <Activity className="text-blue-400" size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{alert.message}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 font-mono">{new Date(alert.timestamp).toLocaleString()}</span>
                        {alert.resolved && (
                          <span className="text-[10px] font-bold tracking-wider uppercase text-vault-green bg-vault-green/10 px-2 py-0.5 rounded">Resolved</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-[#0A0F14] border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors shadow-lg">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-2 rounded-xl ${bg} ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-gray-400 text-sm font-medium mb-1 relative z-10">{title}</p>
      <p className="text-3xl font-bold text-white relative z-10">{value}</p>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ShieldAlert, UserX, ServerCrash, AlertTriangle, ShieldCheck, Activity, Key, Terminal } from 'lucide-react';

export default function SecurityOperationsCenter() {
  const [activeTab, setActiveTab] = useState<'threats' | 'audit'>('threats');

  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['securityMetrics'],
    queryFn: async () => {
      const res = await api.get('/admin/security/metrics');
      return res.data.data;
    },
    refetchInterval: 30000
  });

  const { data: threatsData, isLoading: threatsLoading } = useQuery({
    queryKey: ['securityThreats'],
    queryFn: async () => {
      const res = await api.get('/admin/security/threats');
      return res.data.data;
    },
    enabled: activeTab === 'threats',
    refetchInterval: 15000
  });

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['securityAudit'],
    queryFn: async () => {
      const res = await api.get('/admin/security/audit');
      return res.data.data;
    },
    enabled: activeTab === 'audit',
  });

  if (metricsLoading) {
    return <div className="p-8 text-gray-400">Booting Security Operations Center...</div>;
  }

  const { activeThreats, failedLogins24h, suspiciousIpsBlocked, apiAbuseRate, threatTrend } = metricsData;
  const threats = threatsData || [];
  const auditLogs = auditData || [];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <ShieldAlert className="text-red-500" /> Security Operations Center (SOC)
        </h1>
        <p className="text-gray-400 mt-2">Enterprise threat intelligence, automated API abuse monitoring, and immutable global audit logs.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Active Threats" value={activeThreats} icon={AlertTriangle} color="text-red-500" bg="bg-red-500/10" trend={threatTrend} isNegative />
        <MetricCard title="Failed Logins (24h)" value={failedLogins24h} icon={UserX} color="text-orange-400" bg="bg-orange-400/10" />
        <MetricCard title="Suspicious IPs Blocked" value={suspiciousIpsBlocked} icon={ShieldCheck} color="text-vault-green" bg="bg-vault-green/10" />
        <MetricCard title="API Abuse Rate" value={apiAbuseRate} icon={ServerCrash} color="text-purple-400" bg="bg-purple-400/10" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.05] mb-6">
        <button
          onClick={() => setActiveTab('threats')}
          className={`px-6 py-3 font-bold text-sm tracking-wide transition-colors border-b-2 ${
            activeTab === 'threats' ? 'text-red-400 border-red-500 bg-red-500/5' : 'text-gray-500 border-transparent hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2"><Activity size={16} /> Live Threat Radar</div>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-6 py-3 font-bold text-sm tracking-wide transition-colors border-b-2 ${
            activeTab === 'audit' ? 'text-blue-400 border-blue-500 bg-blue-500/5' : 'text-gray-500 border-transparent hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2"><Terminal size={16} /> Global Audit Timeline</div>
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'threats' ? (
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden shadow-2xl shadow-red-500/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0f1419] border-b border-white/[0.05]">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-400">Timestamp</th>
                  <th className="px-6 py-4 font-semibold text-gray-400">Severity</th>
                  <th className="px-6 py-4 font-semibold text-gray-400">Event Signature</th>
                  <th className="px-6 py-4 font-semibold text-gray-400">User / IP Context</th>
                  <th className="px-6 py-4 font-semibold text-gray-400">Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {threatsLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Scanning threat feeds...</td></tr>
                ) : threats.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-mono">No active threats detected.</td></tr>
                ) : (
                  threats.map((threat: any) => (
                    <tr key={threat.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                        {new Date(threat.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          threat.severity === 'critical' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                          threat.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {threat.severity || 'Medium'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-bold">{threat.eventType}</div>
                        <div className="text-gray-500 text-xs mt-1 max-w-md line-clamp-2">{threat.details}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-300">{threat.user?.email || 'Unauthenticated'}</div>
                        <div className="text-gray-500 text-xs font-mono mt-0.5">{threat.ipAddress}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold ${threat.resolved ? 'text-vault-green' : 'text-red-400'}`}>
                          {threat.resolved ? 'Mitigated' : 'Investigating'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 shadow-2xl shadow-blue-500/5">
          {auditLoading ? (
            <div className="text-center text-gray-500 py-8">Pulling immutable ledger...</div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8 font-mono">Ledger is empty.</div>
          ) : (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {auditLogs.map((log: any) => (
                <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Timeline Marker */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#0f1419] text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    {log.module === 'BILLING' ? <Key size={14} className="text-blue-400" /> : <Terminal size={14} />}
                  </div>
                  
                  {/* Content Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/5 border border-white/10 p-4 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                        log.action === 'DELETE' ? 'bg-red-500/10 text-red-400' :
                        log.action === 'UPDATE' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-vault-green/10 text-vault-green'
                      }`}>
                        {log.action}
                      </span>
                      <time className="text-xs text-gray-500 font-mono">{new Date(log.createdAt).toLocaleString()}</time>
                    </div>
                    <div className="text-sm font-bold text-white mb-1">
                      {log.user?.name} <span className="text-gray-500 font-normal">performed</span> {log.module} <span className="text-gray-500 font-normal">action</span>
                    </div>
                    <div className="text-xs text-gray-400 leading-relaxed">
                      {log.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg, trend, isNegative }: any) {
  return (
    <div className="bg-[#0A0F14] border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors shadow-lg">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-2 rounded-xl ${bg} ${color}`}>
          <Icon size={20} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${isNegative ? 'text-red-500' : 'text-vault-green'}`}>
            {trend}
          </div>
        )}
      </div>
      <p className="text-gray-400 text-sm font-medium mb-1 relative z-10">{title}</p>
      <p className="text-3xl font-bold text-white relative z-10">{value}</p>
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] rounded-full ${bg} opacity-20 group-hover:opacity-40 transition-opacity`} />
    </div>
  );
}

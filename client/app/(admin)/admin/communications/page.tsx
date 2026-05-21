'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Mail, Send, AlertTriangle, Activity, CloudLightning, ShieldCheck, Edit, Eye } from 'lucide-react';

export default function CommunicationsDashboard() {
  const [testType, setTestType] = useState('email');
  const [testProvider, setTestProvider] = useState('resend');

  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['commMetrics'],
    queryFn: async () => {
      const res = await api.get('/admin/communications/metrics');
      return res.data.data;
    }
  });

  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['commTemplates'],
    queryFn: async () => {
      const res = await api.get('/admin/communications/templates');
      return res.data.data;
    }
  });

  const sendTest = useMutation({
    mutationFn: async () => {
      return api.post('/admin/communications/test', { provider: testProvider, type: testType });
    }
  });

  if (metricsLoading || templatesLoading) {
    return <div className="p-8 text-gray-400">Loading communications telemetry...</div>;
  }

  const { totalSent, deliveryRate, openRate, failedDeliveries, activeBounces, timeSeries } = metricsData;
  const templates = templatesData || [];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Mail className="text-blue-400" /> Communications Center
        </h1>
        <p className="text-gray-400 mt-2">Global command infrastructure for emails, push notifications, and automated alerts.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Outbound (30d)" value={totalSent.toLocaleString()} icon={Send} color="text-blue-400" bg="bg-blue-400/10" />
        <MetricCard title="Avg. Delivery Rate" value={`${deliveryRate}%`} icon={Activity} color="text-vault-green" bg="bg-vault-green/10" />
        <MetricCard title="Avg. Open Rate" value={`${openRate}%`} icon={Eye} color="text-purple-400" bg="bg-purple-400/10" />
        <MetricCard title="Failed / Bounced" value={failedDeliveries + activeBounces} icon={AlertTriangle} color="text-red-400" bg="bg-red-400/10" isNegative />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Outbound Traffic Chart */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Global Outbound Traffic (30 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries}>
                <defs>
                  <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPush" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C084FC" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C084FC" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#666" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="emails" name="Emails Sent" stroke="#60A5FA" strokeWidth={2} fillOpacity={1} fill="url(#colorEmails)" />
                <Area type="monotone" dataKey="pushes" name="Push Sent" stroke="#C084FC" strokeWidth={2} fillOpacity={1} fill="url(#colorPush)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Integration Status Panel */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <CloudLightning className="text-yellow-400" size={20} /> Network Integrations
          </h3>
          
          <div className="space-y-4 flex-1">
            <IntegrationRow name="Resend" type="Primary Email API" status="Healthy" />
            <IntegrationRow name="SendGrid" type="Fallback Email API" status="Standby" />
            <IntegrationRow name="Firebase" type="FCM Push Services" status="Healthy" />
            <IntegrationRow name="Automations" type="Internal Webhooks" status="Healthy" />
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-sm font-bold text-gray-400 mb-3">Diagnostic Tools</h4>
            <div className="flex gap-2 mb-3">
              <select 
                value={testProvider}
                onChange={e => setTestProvider(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none flex-1"
              >
                <option value="resend">Resend</option>
                <option value="sendgrid">SendGrid</option>
                <option value="firebase">Firebase</option>
              </select>
              <select 
                value={testType}
                onChange={e => setTestType(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none flex-1"
              >
                <option value="email">Email</option>
                <option value="push">Push Payload</option>
              </select>
            </div>
            <button 
              onClick={() => sendTest.mutate()}
              disabled={sendTest.isPending}
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              {sendTest.isPending ? 'Simulating...' : 'Send Test Payload'}
            </button>
            {sendTest.isSuccess && (
              <p className="text-vault-green text-xs mt-2 text-center">Payload successfully routed!</p>
            )}
          </div>
        </div>
      </div>

      {/* Templates Ledger */}
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.05] flex justify-between items-center bg-white/[0.01]">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Edit size={20} className="text-gray-400" /> Managed Templates
          </h3>
          <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold transition-colors">
            Create Template
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.02] border-b border-white/[0.05]">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-400">Template Name</th>
                <th className="px-6 py-4 font-semibold text-gray-400">ID Key</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Provider Node</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Last Modified</th>
                <th className="px-6 py-4 font-semibold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {templates.map((tpl: any) => (
                <tr key={tpl.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{tpl.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">{tpl.id}</td>
                  <td className="px-6 py-4 text-gray-300">{tpl.provider}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      tpl.status === 'active' ? 'bg-vault-green/10 text-vault-green' : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      {tpl.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{new Date(tpl.lastUpdated).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold transition-colors">
                      Edit Code
                    </button>
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

function MetricCard({ title, value, icon: Icon, color, bg, isNegative }: any) {
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

function IntegrationRow({ name, type, status }: any) {
  const isHealthy = status === 'Healthy';
  return (
    <div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`h-2 w-2 rounded-full ${isHealthy ? 'bg-vault-green shadow-[0_0_8px_rgba(205,255,115,0.8)]' : 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]'}`} />
        <div>
          <p className="text-sm font-bold text-white">{name}</p>
          <p className="text-xs text-gray-400">{type}</p>
        </div>
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${isHealthy ? 'text-vault-green' : 'text-yellow-400'}`}>
        {status}
      </span>
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Users, AlertTriangle, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function RevenueBillingDashboard() {
  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['revenueAnalytics'],
    queryFn: async () => {
      const res = await api.get('/api/admin/billing/revenue');
      return res.data.data;
    }
  });

  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['billingInvoices'],
    queryFn: async () => {
      const res = await api.get('/api/admin/billing/invoices');
      return res.data.data;
    }
  });

  if (isLoadingRevenue || isLoadingInvoices) {
    return <div className="p-8 text-gray-400">Loading financial systems...</div>;
  }

  const { mrr, arr, activeSubscriptions, churnRate, timeSeries } = revenueData;
  const invoices = invoicesData || [];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <DollarSign className="text-vault-green" /> Revenue & Billing
        </h1>
        <p className="text-gray-400 mt-2">Financial command center for tracking MRR, analyzing churn, and managing global invoices.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Monthly Recurring Revenue" value={`$${mrr.toLocaleString()}`} icon={TrendingUp} color="text-vault-green" bg="bg-vault-green/10" trend="+12.5%" />
        <MetricCard title="Annual Run Rate (ARR)" value={`$${arr.toLocaleString()}`} icon={DollarSign} color="text-blue-400" bg="bg-blue-400/10" />
        <MetricCard title="Active Subscribers" value={activeSubscriptions.toLocaleString()} icon={Users} color="text-purple-400" bg="bg-purple-400/10" />
        <MetricCard title="Churn Rate (Simulated)" value={`${churnRate}%`} icon={AlertTriangle} color="text-red-400" bg="bg-red-400/10" trend="-0.4%" isNegative />
      </div>

      {/* MRR Growth Chart */}
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-bold text-white mb-6">MRR Growth (Trailing 12 Months)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeries}>
              <defs>
                <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#CDFF73" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#CDFF73" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="#666" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val.toLocaleString()}`} width={80} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#CDFF73', fontWeight: 'bold' }}
                formatter={(value: any) => [`$${value?.toLocaleString()}`, 'MRR']}
              />
              <Area type="monotone" dataKey="mrr" stroke="#CDFF73" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.05] flex justify-between items-center bg-white/[0.01]">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText size={20} className="text-gray-400" /> Recent Transactions & Invoices
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.02] border-b border-white/[0.05]">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-400">Invoice ID</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Customer</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Plan</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Amount</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No recent transactions found.</td>
                </tr>
              ) : (
                invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                      {inv.stripeInvoiceId || inv.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{inv.user?.name || 'Unknown User'}</div>
                      <div className="text-xs text-gray-500">{inv.user?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {inv.subscription?.plan?.name || 'Manual'}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      ${Number(inv.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        inv.status === 'PAID' ? 'bg-vault-green/10 text-vault-green' : 
                        inv.status === 'FAILED' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.status === 'PAID' ? (
                        <button className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold transition-colors">
                          Refund
                        </button>
                      ) : (
                        <button className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold transition-colors">
                          View Details
                        </button>
                      )}
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

function MetricCard({ title, value, icon: Icon, color, bg, trend, isNegative }: any) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-2 rounded-xl ${bg} ${color}`}>
          <Icon size={20} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${isNegative ? 'text-red-400' : 'text-vault-green'}`}>
            {isNegative ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-gray-400 text-sm font-medium mb-1 relative z-10">{title}</p>
      <p className="text-3xl font-bold text-white relative z-10">{value}</p>
      
      {/* Ambient Glow */}
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] rounded-full ${bg} opacity-50 group-hover:opacity-100 transition-opacity`} />
    </div>
  );
}

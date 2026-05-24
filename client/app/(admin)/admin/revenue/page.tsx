'use client';

import { DollarSign, TrendingUp, CreditCard, Activity, Calendar } from 'lucide-react';

export default function AdminRevenueDashboard() {
  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Revenue Analytics</h1>
        <p className="text-gray-400 mt-2">Monitor financial health, subscription metrics, and growth trajectories.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard 
          title="Monthly Recurring Revenue" 
          value="$124,500" 
          trend="+14.5%" 
          isPositive={true} 
          icon={DollarSign} 
        />
        <KPICard 
          title="Total Invoiced" 
          value="$89,200" 
          trend="+5.2%" 
          isPositive={true} 
          icon={CreditCard} 
        />
        <KPICard 
          title="Churn Rate" 
          value="1.2%" 
          trend="-0.4%" 
          isPositive={true} 
          icon={Activity} 
        />
        <KPICard 
          title="Annual Run Rate" 
          value="$1.49M" 
          trend="+12.0%" 
          isPositive={true} 
          icon={TrendingUp} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Placeholder */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 h-[400px] flex flex-col relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Revenue Growth Overview</h2>
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg">
              <Calendar size={14} /> Year to Date
            </div>
          </div>
          
          <div className="flex-1 w-full flex items-end gap-2 px-2 pb-4 pt-10">
            {/* Mock bars for chart visualization */}
            {[40, 55, 45, 60, 75, 65, 80, 95, 85, 100].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end items-center h-full group/bar cursor-pointer">
                <div 
                  className="w-full bg-vault-green/20 rounded-t-sm border-t border-vault-green/50 transition-all duration-300 group-hover/bar:bg-vault-green/40"
                  style={{ height: `${height}%` }}
                ></div>
                <div className="mt-2 text-[10px] text-gray-500 font-medium">M{i+1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 flex flex-col h-[400px]">
          <h2 className="text-lg font-semibold text-white mb-6">Revenue Breakdown</h2>
          
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <BreakdownItem label="Enterprise Subscriptions" value="$85,000" percentage={68} color="bg-vault-green" />
            <BreakdownItem label="Pro Subscriptions" value="$25,500" percentage={20} color="bg-blue-500" />
            <BreakdownItem label="Overage & Usage Fees" value="$14,000" percentage={12} color="bg-purple-500" />
          </div>
        </div>
      </div>
      
      {/* Recent Transactions Placeholder */}
      <div className="mt-8 bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.05]">
          <h2 className="text-lg font-semibold text-white">Recent High-Value Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-400">Transaction ID</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Client</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Amount</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              <TransactionRow id="TRX-99812A" client="Acme Corporation" date="Today, 2:45 PM" amount="$12,500.00" status="Completed" />
              <TransactionRow id="TRX-88231C" client="Globex Inc" date="Yesterday, 9:12 AM" amount="$4,200.00" status="Completed" />
              <TransactionRow id="TRX-77192B" client="Initech Solutions" date="Oct 12, 4:20 PM" amount="$8,500.00" status="Pending" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, isPositive, icon: Icon }: any) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={64} />
      </div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon size={16} className="text-vault-green" />
        </div>
      </div>
      <div className="relative z-10">
        <div className="text-3xl font-bold text-white mb-2">{value}</div>
        <div className={`text-sm font-medium flex items-center gap-1 ${isPositive ? 'text-vault-green' : 'text-red-400'}`}>
          {trend} <span className="text-gray-500 font-normal">vs last month</span>
        </div>
      </div>
    </div>
  );
}

function BreakdownItem({ label, value, percentage, color }: any) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-300 font-medium">{label}</span>
        <span className="text-white font-bold">{value}</span>
      </div>
      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function TransactionRow({ id, client, date, amount, status }: any) {
  return (
    <tr className="hover:bg-white/[0.02] transition-colors">
      <td className="px-6 py-4 font-mono text-xs text-gray-400">{id}</td>
      <td className="px-6 py-4 font-medium text-white">{client}</td>
      <td className="px-6 py-4 text-gray-400">{date}</td>
      <td className="px-6 py-4 font-semibold text-vault-green">{amount}</td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          status === 'Completed' ? 'bg-vault-green/10 text-vault-green' : 'bg-yellow-500/10 text-yellow-500'
        }`}>
          {status}
        </span>
      </td>
    </tr>
  );
}

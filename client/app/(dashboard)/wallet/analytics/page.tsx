'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  BarChart as BarChartIcon,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  Target,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart, 
  Pie, 
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { useRouter } from 'next/navigation';

export default function WalletAnalyticsPage() {
  const router = useRouter();
  const { data: analytics, isLoading, isError } = useQuery({
    queryKey: ['wallet-analytics'],
    queryFn: async () => {
      const res = await api.get('/api/wallet/analytics');
      return res.data.data;
    }
  });

  if (isLoading) return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-vault-green" size={32} />
      </div>
    </PageContainer>
  );

  if (isError || !analytics) return (
    <PageContainer>
      <div className="text-center py-20 text-red-400">Failed to load analytics.</div>
    </PageContainer>
  );

  const fmt = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const COLORS = ['#00FF88', '#3B82F6', '#A855F7', '#F59E0B', '#EF4444', '#EC4899'];

  const { categories, trends, summary } = analytics;

  return (
    <PageContainer>
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <PageHeader 
          title="Financial Insights" 
          description="Advanced data visualization of your liquidity and spending behavior." 
        />
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-vault-green/5 blur-3xl group-hover:bg-vault-green/10 transition-all" />
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Net Savings</p>
          <h2 className="text-3xl font-display font-bold text-white">{fmt(summary.netSavings)}</h2>
          <p className="text-[10px] text-vault-green font-bold mt-2 flex items-center gap-1">
            <TrendingUp size={10} /> Positive Cashflow
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 relative overflow-hidden group">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Savings Rate</p>
          <h2 className="text-3xl font-display font-bold text-purple-400">{summary.savingsRate}%</h2>
          <div className="w-full bg-white/5 h-1 rounded-full mt-4 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${summary.savingsRate}%` }}
              className="h-full bg-purple-500" 
            />
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Inbound</p>
          <h2 className="text-3xl font-display font-bold text-vault-green">{fmt(summary.totalIncome)}</h2>
          <p className="text-[10px] text-gray-500 mt-2">Lifetime revenue</p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Outbound</p>
          <h2 className="text-3xl font-display font-bold text-red-400">{fmt(summary.totalExpense)}</h2>
          <p className="text-[10px] text-gray-500 mt-2">Lifetime burn</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Trend Chart (8 cols) */}
        <div className="col-span-8 bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-white font-bold flex items-center gap-3">
              <BarChartIcon className="text-vault-green" size={20} />
              Monthly Performance
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-vault-green" />
                <span className="text-[10px] font-bold text-gray-500 uppercase">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-[10px] font-bold text-gray-500 uppercase">Expense</span>
              </div>
            </div>
          </div>
          
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Bar dataKey="income" fill="#00FF88" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie (4 cols) */}
        <div className="col-span-4 bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8">
          <h3 className="text-white font-bold flex items-center gap-3 mb-8">
            <PieChartIcon className="text-purple-400" size={20} />
            Spending Mix
          </h3>
          
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categories.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 space-y-4">
            {categories.slice(0, 4).map((cat: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs font-bold text-gray-400">{cat.name}</span>
                </div>
                <span className="text-xs font-bold text-white">{fmt(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="bg-vault-green/5 border border-vault-green/10 rounded-3xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-vault-green/20 flex items-center justify-center text-vault-green shrink-0">
            <Target size={20} />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-1">Savings Goal</h4>
            <p className="text-xs text-gray-500 leading-relaxed">You are on track to save {fmt(summary.netSavings * 1.2)} by next quarter if spending remains stable.</p>
          </div>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Zap size={20} />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-1">Efficiency Insight</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Your {categories[0]?.name || 'primary'} spending has decreased by 12% compared to last month.</p>
          </div>
        </div>
        <button 
          onClick={() => router.push('/wallet')}
          className="bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] rounded-3xl p-6 flex flex-col items-center justify-center gap-2 group transition-all"
        >
          <div className="text-gray-500 group-hover:text-vault-green transition-colors">
            <ArrowUpRight size={32} />
          </div>
          <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">Back to Dashboard</span>
        </button>
      </div>
    </PageContainer>
  );
}

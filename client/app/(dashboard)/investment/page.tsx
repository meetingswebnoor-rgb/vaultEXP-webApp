'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { AddInvestmentModal } from '@/components/investment/AddInvestmentModal';
import { InvestmentReportModal } from '@/components/investment/InvestmentReportModal';
import { InvestmentListCard } from '@/components/mobile/investment/InvestmentListCard';
import { DesktopInvestmentLayout } from '@/components/desktop/investment/DesktopInvestmentLayout';
import { AIInvestmentIntelligence } from '@/components/investment/AIInvestmentIntelligence';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Loader2, Plus, AlertCircle, TrendingUp, DollarSign, Activity, PieChart as PieChartIcon, FileBarChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from 'recharts';
import { generateGrowthData, generateDistributionData } from '@/lib/utils/investment';



interface Investment {
  _id: string;
  name: string;
  type: string;
  currentValue: number;
  amountInvested: number;
}

interface InvestmentResponse {
  success: boolean;
  data: {
    investments: Investment[];
    count: number;
    summary?: {
      totalValue: number;
      totalProfitLoss: number;
    };
  };
}

export default function InvestmentPage() {
  const { isMobile, isTablet } = useBreakpoint();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const { data, isLoading, isError } = useQuery<InvestmentResponse>({
    queryKey: ['investments'],
    queryFn: async () => {
      const res = await api.get('/api/investment');
      return res.data;
    },
    retry: 1,
  });

  const investments = Array.isArray(data?.data?.investments) ? data.data.investments : [];
  const summary = data?.data?.summary ?? { totalValue: 0, totalProfitLoss: 0 };
  const hasInvestments = investments.length > 0;
  const isPositive = summary.totalProfitLoss >= 0;
  
  const growthData = generateGrowthData(investments);
  const distributionData = generateDistributionData(investments);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-vault-green animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mt-8">
          <AlertCircle size={18} />
          <span className="text-sm">Failed to load investments. Please try again.</span>
        </div>
      </PageContainer>
    );
  }

  if (!isMobile && !isTablet) {
    return (
      <>
        <DesktopInvestmentLayout 
          investments={investments} 
          summary={summary} 
          onAdd={() => setIsAddModalOpen(true)} 
        />
        <AddInvestmentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      </>
    );
  }

  return (
    <PageContainer>
      <AddInvestmentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <InvestmentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        investments={investments}
        summary={summary}
      />

      {/* 1. Header Section */}
      <div className="flex items-center justify-between mb-4">
        <PageHeader
          title="Investments"
          description="Track and manage your diverse portfolio."
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsReportOpen(true)}
            className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <FileBarChart size={18} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsAddModalOpen(true)}
            className="w-10 h-10 rounded-full bg-vault-green flex items-center justify-center text-black shadow-[0_0_15px_rgba(0,255,136,0.3)]"
          >
            <Plus size={20} strokeWidth={3} />
          </motion.button>
        </div>
      </div>

      {/* 2. Total Value Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-mobile p-5 mb-6 relative overflow-hidden"
      >
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-vault-green/10 rounded-full blur-2xl" />
        
        <p className="text-gray-400 text-sm font-bold tracking-widest uppercase mb-1">Total Portfolio</p>
        <h2 className="text-4xl font-display font-bold text-white mb-3">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(summary.totalValue)}
        </h2>
        
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold ${isPositive ? 'bg-vault-green/20 text-vault-green' : 'bg-red-500/20 text-red-400'}`}>
            <TrendingUp size={12} />
            <span>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', signDisplay: 'always' }).format(summary.totalProfitLoss)}
            </span>
          </div>
          <span className="text-gray-500 text-xs">All Time Return</span>
        </div>
      </motion.div>

      {/* AI Investment Intelligence */}
      <div className="mb-6">
        <AIInvestmentIntelligence />
      </div>

      {/* 3. Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card-mobile p-4 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Activity size={16} className="text-vault-green" />
            Performance
          </h3>
          <span className="text-xs text-gray-500 bg-vault-dark px-2 py-1 rounded-md border border-vault-border">YTD</span>
        </div>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00FF88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                itemStyle={{ color: '#00FF88', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#00FF88" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Distribution Chart */}
      {distributionData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card-mobile p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-bold flex items-center gap-2">
              <PieChartIcon size={16} className="text-vault-green" />
              Asset Distribution
            </h3>
          </div>
          
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  formatter={(value: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value as number)}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value: string) => <span className="text-gray-400 text-xs capitalize">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Action Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsAddModalOpen(true)}
        className="w-full py-4 bg-vault-green/10 border border-vault-green/30 text-vault-green font-bold rounded-2xl mb-6
                   flex items-center justify-center gap-2 hover:bg-vault-green/20 transition-all shadow-[0_0_15px_rgba(0,255,136,0.1)]"
      >
        <Plus size={18} strokeWidth={3} />
        Add New Investment
      </motion.button>

      {/* 4. Investment List */}
      <div>
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <DollarSign size={16} className="text-vault-green" />
          Your Assets
        </h3>
        
        {!hasInvestments ? (
          <div className="p-8 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
            <div className="w-12 h-12 rounded-full bg-vault-dark mx-auto flex items-center justify-center text-gray-500 mb-3 border border-vault-border">
              <Activity size={20} />
            </div>
            <p className="text-white font-bold mb-1">No investments yet</p>
            <p className="text-gray-500 text-sm">Add your first asset to track performance.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {investments.map((investment, i) => (
              <motion.div
                key={investment._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <InvestmentListCard
                  _id={investment._id}
                  name={investment.name}
                  type={investment.type}
                  currentValue={investment.currentValue}
                  amountInvested={investment.amountInvested}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Download, TrendingUp, TrendingDown, DollarSign, Activity, PieChart as PieChartIcon } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { calculateInvestmentPerformance, generateGrowthData, generateDistributionData } from '@/lib/utils/investment';
import { InvestmentReportModal } from '@/components/investment/InvestmentReportModal';
import { AIInvestmentIntelligence } from '@/components/investment/AIInvestmentIntelligence';

interface Investment {
  _id: string;
  name: string;
  type: string;
  currentValue: number;
  amountInvested: number;
  platform?: string;
  purchaseDate?: string;
}

interface DesktopInvestmentLayoutProps {
  investments: Investment[];
  summary: {
    totalValue: number;
    totalProfitLoss: number;
  };
  onAdd: () => void;
}



export function DesktopInvestmentLayout({ investments, summary, onAdd }: DesktopInvestmentLayoutProps) {
  const isPositive = summary.totalProfitLoss >= 0;
  const [isReportOpen, setIsReportOpen] = useState(false);
  const router = useRouter();
  
  const growthData = generateGrowthData(investments);
  const distributionData = generateDistributionData(investments);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      <InvestmentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        investments={investments}
        summary={summary}
      />
      {/* ── Top Header & Actions ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Investment Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage and analyze your complete portfolio</p>
        </div>
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsReportOpen(true)}
            className="px-6 py-3 bg-vault-dark border border-vault-border text-white font-bold rounded-2xl flex items-center gap-2 hover:bg-white/[0.05] transition-all"
          >
            <Download size={18} />
            Generate Report
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onAdd}
            className="px-6 py-3 bg-vault-green text-vault-darker font-bold rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,136,0.2)] hover:shadow-[0_0_25px_rgba(0,255,136,0.4)] transition-all"
          >
            <Plus size={18} strokeWidth={3} />
            Add Investment
          </motion.button>
        </div>
      </div>

      {/* ── AI Investment Intelligence Engine ── */}
      <div className="mb-8">
        <AIInvestmentIntelligence />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── LEFT COLUMN: Holdings Table (8 cols) ── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-vault-dark border border-vault-border rounded-3xl p-6 h-[calc(100vh-200px)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <PieChartIcon className="text-vault-green" size={20} />
                Holdings Table
              </h2>
            </div>
            
            <div className="flex-1 overflow-auto pr-2">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-vault-dark/95 backdrop-blur-sm z-10">
                  <tr>
                    <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/[0.05]">Asset Name</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/[0.05]">Type</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/[0.05] text-right">Invested</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/[0.05] text-right">Value</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/[0.05] text-right">Return</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(investments) ? investments : []).map((inv) => {
                    const { profitLoss, percentage, isPositive } = calculateInvestmentPerformance(inv.currentValue || 0, inv.amountInvested || 0);
                    return (
                      <tr
                        key={inv._id}
                        onClick={() => router.push(`/investment/${inv._id}`)}
                        className="border-b border-white/[0.02] hover:bg-white/[0.04] transition-colors group cursor-pointer"
                      >
                        <td className="py-4 px-4 font-bold text-white">{inv.name}</td>
                        <td className="py-4 px-4 text-sm text-gray-400 capitalize">{inv.type.replace('_', ' ')}</td>
                        <td className="py-4 px-4 text-sm text-gray-400 text-right">{formatCurrency(inv.amountInvested)}</td>
                        <td className="py-4 px-4 text-sm font-bold text-white text-right font-display">{formatCurrency(inv.currentValue)}</td>
                        <td className={`py-4 px-4 text-sm font-bold text-right flex flex-col items-end gap-1 ${isPositive ? 'text-vault-green' : 'text-red-400'}`}>
                          <div className="flex items-center gap-1">
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {formatCurrency(profitLoss)}
                          </div>
                          <span className="text-[10px] opacity-75">
                            {percentage > 0 ? '+' : ''}{percentage.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {investments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-500">
                        No investments found. Click &quot;Add Investment&quot; to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Analytics & Charts (4 cols) ── */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Portfolio Overview & Profit/Loss Summary */}
          <div className="bg-vault-dark border border-vault-border rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-vault-green/5 rounded-full blur-3xl" />
            
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Portfolio Overview</h3>
            <h2 className="text-5xl font-display font-bold text-white mb-6">
              {formatCurrency(summary.totalValue)}
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Total Invested</p>
                <p className="text-lg font-bold text-white font-display">
                  {formatCurrency(summary.totalValue - summary.totalProfitLoss)}
                </p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Profit / Loss</p>
                <div className={`flex items-center gap-1 text-lg font-bold font-display ${isPositive ? 'text-vault-green' : 'text-red-400'}`}>
                  {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{formatCurrency(summary.totalProfitLoss)}</span>
                </div>
                <div className={`text-xs mt-1 font-bold ${isPositive ? 'text-vault-green/70' : 'text-red-400/70'}`}>
                  {(() => {
                    const totalInvested = summary.totalValue - summary.totalProfitLoss;
                    const { percentage } = calculateInvestmentPerformance(summary.totalValue, totalInvested);
                    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}% All Time`;
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Performance Chart */}
          <div className="bg-vault-dark border border-vault-border rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Activity size={16} className="text-vault-green" />
                Performance Chart
              </h3>
            </div>
            
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FF88" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00FF88" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
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
                    fill="url(#colorPerf)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* 3. Distribution Chart */}
          <div className="bg-vault-dark border border-vault-border rounded-3xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <PieChartIcon size={16} className="text-vault-green" />
                Asset Distribution
              </h3>
            </div>
            
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
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
                    formatter={(value: any) => formatCurrency(value as number)}
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
          </div>
          
        </div>
      </div>
    </div>
  );
}

'use client';

import { useRef } from 'react';
import {
  X, Download, TrendingUp, TrendingDown, Printer,
  BarChart2, DollarSign, Activity, CalendarDays
} from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateInvestmentPerformance } from '@/lib/utils/investment';
import { GlobalModal } from '@/components/ui/GlobalModal';

interface Investment {
  _id: string;
  name: string;
  type: string;
  currentValue: number;
  amountInvested: number;
  platform?: string;
  purchaseDate?: string;
}

interface InvestmentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  investments: Investment[];
  summary: {
    totalValue: number;
    totalProfitLoss: number;
  };
}

const TYPE_LABELS: Record<string, string> = {
  stock: 'Stock / Equity',
  crypto: 'Cryptocurrency',
  mutual_fund: 'Mutual Fund / ETF',
  business: 'Private Business',
  manual_asset: 'Other Asset',
};

export function InvestmentReportModal({ isOpen, onClose, investments, summary }: InvestmentReportModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const fmt = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val ?? 0);

  const fmtSigned = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', signDisplay: 'always' }).format(val ?? 0);

  const totalInvested = summary.totalValue - summary.totalProfitLoss;
  const { percentage: overallPct, isPositive: overallPositive } = calculateInvestmentPerformance(
    summary.totalValue,
    totalInvested
  );

  // Group assets by type for breakdown
  const breakdown = investments.reduce<Record<string, { count: number; totalValue: number; totalInvested: number }>>((acc, inv) => {
    const t = inv.type || 'manual_asset';
    if (!acc[t]) acc[t] = { count: 0, totalValue: 0, totalInvested: 0 };
    acc[t].count += 1;
    acc[t].totalValue += inv.currentValue || 0;
    acc[t].totalInvested += inv.amountInvested || 0;
    return acc;
  }, {});

  const handleDownloadJSON = () => {
    const reportData = {
      reportTitle: 'VaultEXP Investment Report',
      generatedAt: new Date().toLocaleString(),
      summary: {
        totalPortfolioValue: summary.totalValue,
        totalCapitalInvested: totalInvested,
        totalProfitLoss: summary.totalProfitLoss,
        overallReturnPercentage: `${overallPct.toFixed(2)}%`,
      },
      assetBreakdown: Object.entries(breakdown).map(([type, data]) => ({
        assetType: TYPE_LABELS[type] || type,
        count: data.count,
        totalValue: data.totalValue,
        totalInvested: data.totalInvested,
        profitLoss: data.totalValue - data.totalInvested,
      })),
      investments: investments.map(inv => {
        const { profitLoss, percentage } = calculateInvestmentPerformance(inv.currentValue, inv.amountInvested);
        return {
          name: inv.name,
          type: TYPE_LABELS[inv.type] || inv.type,
          platform: inv.platform || 'N/A',
          amountInvested: inv.amountInvested,
          currentValue: inv.currentValue,
          profitLoss,
          returnPercentage: `${percentage.toFixed(2)}%`,
          purchaseDate: inv.purchaseDate
            ? new Date(inv.purchaseDate).toLocaleDateString()
            : 'N/A',
        };
      }),
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VaultEXP_Report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-2xl"
    >
      {/* Header */}
      <div className="px-7 py-5 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0 relative overflow-hidden">
        <div className="absolute -left-8 -top-8 w-40 h-40 bg-vault-green/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-vault-green/10 border border-vault-green/30 flex items-center justify-center text-vault-green">
            <BarChart2 size={22} />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-white leading-tight">Portfolio Report</h3>
            <p className="text-xs text-gray-500 mt-0.5">Generated {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Print</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadJSON}
            className="px-3 py-2 rounded-xl bg-vault-green/10 border border-vault-green/30 text-vault-green text-xs font-bold flex items-center gap-1.5 hover:bg-vault-green/20 transition-colors"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Download</span>
          </motion.button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div ref={printRef} className="overflow-y-auto p-7 space-y-6">

        {/* ── Summary Stats ── */}
        <section>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Portfolio Summary</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={14} className="text-vault-green" />
                <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Total Value</span>
              </div>
              <p className="text-2xl font-display font-bold text-white">{fmt(summary.totalValue)}</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={14} className="text-blue-400" />
                <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Invested</span>
              </div>
              <p className="text-2xl font-display font-bold text-white">{fmt(totalInvested)}</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                {overallPositive
                  ? <TrendingUp size={14} className="text-vault-green" />
                  : <TrendingDown size={14} className="text-red-400" />}
                <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Return</span>
              </div>
              <p className={`text-2xl font-display font-bold ${overallPositive ? 'text-vault-green' : 'text-red-400'}`}>
                {fmtSigned(summary.totalProfitLoss)}
              </p>
              <p className={`text-xs font-bold mt-0.5 ${overallPositive ? 'text-vault-green/70' : 'text-red-400/70'}`}>
                {overallPct > 0 ? '+' : ''}{overallPct.toFixed(2)}%
              </p>
            </div>
          </div>
        </section>

        {/* ── Asset Breakdown by Type ── */}
        <section>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Asset Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(breakdown).map(([type, data]) => {
              const { profitLoss, percentage, isPositive } = calculateInvestmentPerformance(
                data.totalValue,
                data.totalInvested
              );
              return (
                <div
                  key={type}
                  className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl"
                >
                  <div>
                    <p className="text-white font-bold text-sm">{TYPE_LABELS[type] || type}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{data.count} asset{data.count !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-display font-bold">{fmt(data.totalValue)}</p>
                    <p className={`text-xs font-bold flex items-center justify-end gap-1 mt-0.5 ${isPositive ? 'text-vault-green' : 'text-red-400'}`}>
                      {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {fmtSigned(profitLoss)} ({percentage.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              );
            })}
            {Object.keys(breakdown).length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No investments to break down.</p>
            )}
          </div>
        </section>

        {/* ── Individual Holdings ── */}
        <section>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Individual Holdings</h4>
          <div className="border border-white/[0.05] rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                  <th className="py-3 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Name</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Invested</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Value</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Return</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv, i) => {
                  const { profitLoss, percentage, isPositive } = calculateInvestmentPerformance(
                    inv.currentValue || 0,
                    inv.amountInvested || 0
                  );
                  return (
                    <tr
                      key={inv._id}
                      className={`border-b border-white/[0.03] last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
                    >
                      <td className="py-3 px-4 text-sm font-bold text-white">{inv.name}</td>
                      <td className="py-3 px-4 text-xs text-gray-400 capitalize">{(TYPE_LABELS[inv.type] || inv.type).split('/')[0].trim()}</td>
                      <td className="py-3 px-4 text-sm text-gray-400 text-right">{fmt(inv.amountInvested)}</td>
                      <td className="py-3 px-4 text-sm font-bold text-white text-right">{fmt(inv.currentValue)}</td>
                      <td className={`py-3 px-4 text-sm font-bold text-right ${isPositive ? 'text-vault-green' : 'text-red-400'}`}>
                        <div>{fmtSigned(profitLoss)}</div>
                        <div className="text-[10px] opacity-75">{percentage.toFixed(2)}%</div>
                      </td>
                    </tr>
                  );
                })}
                {investments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">No investments recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <div className="flex items-center gap-2 text-gray-600 text-xs pt-2 border-t border-white/[0.05]">
          <CalendarDays size={12} />
          <span>Report generated on {new Date().toLocaleString()}</span>
          <span className="ml-auto">VaultEXP · Investment Module</span>
        </div>
      </div>
    </GlobalModal>
  );
}

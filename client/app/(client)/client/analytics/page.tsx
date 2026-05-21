'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Sparkles, Download, ArrowUpRight, ArrowDownRight, DollarSign, FileText } from 'lucide-react';
import { api } from '@/lib/api';

export default function ClientAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch from /api/client/analytics
    setTimeout(() => {
      setData({
        aiSummary: "Your Q2 spending is down 15% compared to Q1, primarily due to lower software licensing costs. However, you have 2 outstanding invoices totaling $1,250 that require attention. Based on current trends, your projected Q3 spend is stable at $4,500.",
        kpis: {
          ytdSpend: 12450.00,
          ytdTrend: -15,
          activeSubscriptions: 3,
          outstandingBalance: 1250.00
        },
        monthlyData: [
          { month: 'Jan', amount: 4200 },
          { month: 'Feb', amount: 3800 },
          { month: 'Mar', amount: 4450 },
          { month: 'Apr', amount: 3100 },
          { month: 'May', amount: 2900 },
          { month: 'Jun', amount: 3200 },
        ],
        reports: [
          { id: '1', name: 'Q2 Executive Summary', type: 'PDF', date: '2026-06-01T10:00:00Z', size: '2.4 MB' },
          { id: '2', name: 'YTD Expense Breakdown', type: 'XLSX', date: '2026-05-15T14:30:00Z', size: '1.1 MB' },
          { id: '3', name: 'Q1 Financial Report', type: 'PDF', date: '2026-04-05T09:00:00Z', size: '3.8 MB' },
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  const maxAmount = data ? Math.max(...data.monthlyData.map((d: any) => d.amount)) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full pb-32">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="text-[var(--brand-primary,#2563EB)]" /> Analytics & Reports
          </h1>
          <p className="text-gray-500 mt-2">View financial KPIs, spending trends, and AI-generated insights.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-bold rounded-xl text-sm shadow-sm hover:bg-gray-800 transition-colors">
          <Download size={16} /> Export All
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400">Loading analytics ecosystem...</div>
      ) : (
        <div className="space-y-8">
          
          {/* AI Summary Block */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-purple-200" />
                <h2 className="text-lg font-bold">Vault AI Financial Summary</h2>
              </div>
              <p className="text-lg text-indigo-50 leading-relaxed max-w-4xl font-medium">
                &quot;{data.aiSummary}&quot;
              </p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><DollarSign size={20} /></div>
                <div className={`flex items-center gap-1 text-sm font-bold ${data.kpis.ytdTrend < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.kpis.ytdTrend < 0 ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                  {Math.abs(data.kpis.ytdTrend)}%
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-1 font-bold uppercase tracking-widest">YTD Spending</p>
              <p className="text-3xl font-bold text-gray-900">${data.kpis.ytdSpend.toLocaleString()}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><TrendingUp size={20} /></div>
              </div>
              <p className="text-gray-500 text-sm mb-1 font-bold uppercase tracking-widest">Active Subscriptions</p>
              <p className="text-3xl font-bold text-gray-900">{data.kpis.activeSubscriptions}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl"><DollarSign size={20} /></div>
              </div>
              <p className="text-gray-500 text-sm mb-1 font-bold uppercase tracking-widest">Outstanding Balance</p>
              <p className="text-3xl font-bold text-red-600">${data.kpis.outstandingBalance.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Trends Chart */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-8">Monthly Spending Trend</h3>
              <div className="h-64 flex items-end justify-between gap-2">
                {data.monthlyData.map((item: any) => {
                  const heightPercent = (item.amount / maxAmount) * 100;
                  return (
                    <div key={item.month} className="flex flex-col items-center flex-1 gap-3 group">
                      <div className="w-full relative flex items-end justify-center h-full">
                        <div 
                          className="w-full max-w-[40px] rounded-t-lg transition-all duration-300 group-hover:opacity-80"
                          style={{ 
                            height: `${heightPercent}%`,
                            backgroundColor: 'var(--brand-primary, #2563EB)'
                          }}
                        />
                        {/* Tooltip */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                          ${item.amount.toLocaleString()}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Downloadable Reports */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Generated Reports</h3>
              <div className="flex-1 space-y-4">
                {data.reports.map((report: any) => (
                  <div key={report.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 shadow-sm group-hover:text-[var(--brand-primary)] transition-colors">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate pr-2">{report.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                          {report.type} • {report.size}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-[var(--brand-primary)] bg-white border border-gray-200 rounded-lg shadow-sm transition-colors flex-shrink-0">
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

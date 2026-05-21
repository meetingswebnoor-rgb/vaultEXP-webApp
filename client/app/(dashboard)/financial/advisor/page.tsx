'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { Bot, TrendingUp, AlertTriangle, Lightbulb, Wallet, Clock, Activity } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function AIAdvisorPage() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await api.get('/financial/advisor/insights');
        setInsights(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) return <PageContainer><div className="text-gray-500 animate-pulse">AI is analyzing your financial systems...</div></PageContainer>;
  if (!insights) return null;

  return (
    <PageContainer>
      <PageHeader 
        title="AI Financial Advisor" 
        description="Your virtual CFO. Real-time cash flow forecasting and strategic intelligence." 
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Forecast Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Executive Summary */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Bot size={64} className="text-indigo-400"/></div>
            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-3">
              <Bot size={20} /> Executive Summary
            </div>
            <p className="text-lg text-white font-medium leading-relaxed max-w-2xl">
              {insights.executiveSummary}
            </p>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-indigo-500/20">
              <div>
                <div className="text-xs text-indigo-300/70 font-bold uppercase mb-1">Cash on Hand</div>
                <div className="text-xl font-mono text-white font-bold">${insights.metrics.totalCash.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-indigo-300/70 font-bold uppercase mb-1">Monthly Burn</div>
                <div className="text-xl font-mono text-white font-bold">${insights.metrics.averageMonthlyBurn.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-indigo-300/70 font-bold uppercase mb-1">Est. Runway</div>
                <div className={cn("text-xl font-mono font-bold", parseFloat(insights.metrics.runwayMonths) < 3 ? "text-amber-400" : "text-vault-green")}>
                  {insights.metrics.runwayMonths} months
                </div>
              </div>
            </div>
          </div>

          {/* Forecast Chart Simulation */}
          <div className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-blue-400"/> 90-Day Cash Flow Forecast</h3>
            <div className="relative h-64 w-full flex items-end justify-between gap-2 px-2">
              {/* Background Grid */}
              <div className="absolute inset-0 border-b border-white/10"></div>
              
              {insights.forecast.map((f: any, i: number) => {
                const heightPercentage = Math.max(10, Math.min(100, (f.projectedBalance / (insights.metrics.totalCash || 1)) * 50));
                const isNegative = f.projectedBalance < 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full z-10 group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 text-xs font-mono font-bold text-white bg-black/80 px-2 py-1 rounded">
                      ${f.projectedBalance.toFixed(0)}
                    </div>
                    <div 
                      className={cn("w-full max-w-[4rem] rounded-t-sm transition-all duration-500", isNegative ? "bg-red-500/50" : "bg-blue-500/50 hover:bg-blue-400/70")}
                      style={{ height: `${heightPercentage}%` }}
                    ></div>
                    <div className="mt-3 text-xs font-bold text-gray-500 uppercase">{f.month}</div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
          
          {/* Risks */}
          <div className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-amber-400"/> Critical Risks</h3>
            <div className="space-y-4">
              {insights.risks.length === 0 && <p className="text-sm text-gray-500">No critical financial risks detected.</p>}
              {insights.risks.map((risk: any, i: number) => (
                <div key={i} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-amber-400 mb-1">{risk.title}</h4>
                  <p className="text-xs text-amber-100/70 leading-relaxed">{risk.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Lightbulb size={18} className="text-vault-green"/> AI Recommendations</h3>
            <div className="space-y-4">
              {insights.recommendations.length === 0 && <p className="text-sm text-gray-500">No active recommendations.</p>}
              {insights.recommendations.map((rec: any, i: number) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-vault-green mb-1 flex items-center justify-between">
                    {rec.title}
                    <span className="text-[9px] uppercase tracking-wider text-gray-500 bg-black/50 px-2 py-0.5 rounded">{rec.type}</span>
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </PageContainer>
  );
}

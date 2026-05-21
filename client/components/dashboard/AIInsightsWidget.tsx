'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, TrendingUp, Info, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function AIInsightsWidget() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await api.get('/api/ai/insights');
        setData(res.data?.data);
      } catch (error) {
        console.error('Failed to load AI insights', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const getSeverityIcon = (type: string, severity: string) => {
    if (type === 'spike') return <TrendingUp className="w-4 h-4 text-orange-400" />;
    if (type === 'overdue' || severity === 'high') return <AlertTriangle className="w-4 h-4 text-red-400" />;
    return <Info className="w-4 h-4 text-blue-400" />;
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'bg-red-500/10 border-red-500/20 text-red-200';
    if (severity === 'medium') return 'bg-orange-500/10 border-orange-500/20 text-orange-200';
    return 'bg-blue-500/10 border-blue-500/20 text-blue-200';
  };

  const handleAction = (route: string) => {
    router.push(route || '/dashboard');
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-center min-h-[200px] mb-8">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-zinc-400 text-sm">VaultAI is analyzing your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data || (!data.summary && (!data.anomalies || data.anomalies.length === 0))) {
    return null; // Don't render if no insights
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-900/40 to-blue-900/20 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden mb-8"
    >
      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
        <Sparkles className="w-32 h-32 text-indigo-400" />
      </div>

      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-white">Daily AI Summary</h3>
      </div>

      <p className="text-indigo-100/80 text-sm mb-6 leading-relaxed max-w-3xl">
        {data.summary || "All systems nominal. No significant changes in your financial footprint."}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {/* Anomalies Panel */}
        {data.anomalies && data.anomalies.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">Detected Activity</h4>
            {data.anomalies.map((anomaly: any, i: number) => (
              <div 
                key={i}
                className={`flex items-start space-x-3 p-3 rounded-xl border ${getSeverityColor(anomaly.severity)}`}
              >
                <div className="mt-0.5">{getSeverityIcon(anomaly.type, anomaly.severity)}</div>
                <p className="text-sm">{anomaly.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations Panel */}
        {data.recommendations && data.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">Recommended Actions</h4>
            {data.recommendations.map((rec: any, i: number) => (
              <button
                key={i}
                onClick={() => handleAction(rec.route)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group text-left"
              >
                <div>
                  <p className="text-sm text-white font-medium">{rec.actionText}</p>
                  <p className="text-xs text-zinc-400 mt-1">{rec.actionType}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

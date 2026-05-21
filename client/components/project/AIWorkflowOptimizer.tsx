'use client';
import React, { useState } from 'react';
import { Sparkles, Loader2, Target, AlertTriangle, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

export default function AIWorkflowOptimizer({ projectId }: { projectId: string }) {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const optimize = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/projects/${projectId}/ai-optimize`);
      setInsights(res.data.data.insights);
    } catch (err) {
      console.error(err);
      setInsights('Failed to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-vault-card to-vault-darker border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] pointer-events-none" />
      
      <div className="p-5 border-b border-white/5 flex items-center gap-3 relative z-10">
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
          <Sparkles size={16} className="text-purple-400" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">AI Workflow Optimizer</h3>
          <p className="text-xs text-gray-400">Intelligent task prioritization</p>
        </div>
      </div>
      
      <div className="p-5 relative z-10">
        {insights ? (
          <div className="text-sm text-gray-300 leading-relaxed space-y-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              {insights}
            </div>
            <button 
              onClick={() => setInsights(null)}
              className="text-xs text-purple-400 hover:text-purple-300 font-bold"
            >
              Close Insights
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <Target size={16} className="text-blue-400 mb-2" />
                <p className="text-xs text-gray-400">Analyze Bottlenecks</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <TrendingUp size={16} className="text-green-400 mb-2" />
                <p className="text-xs text-gray-400">Optimize Flow</p>
              </div>
            </div>
            <button 
              onClick={optimize} 
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Run AI Optimizer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Zap, Plus, Play, ArrowRight, ToggleRight, BrainCircuit, Loader2, Sparkles, AlertCircle, Activity, Clock, CheckCircle2, XCircle, Settings2, GitMerge, FileText } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils/cn';

export default function AutomationDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const token = useAuthStore((s: any) => s.token);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      try {
        const [dashRes, logsRes] = await Promise.all([
          axios.get(`${API_URL}/automation/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/automation/logs`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setStats(dashRes.data.data.stats);
        setAiSuggestions(dashRes.data.data.aiSuggestions);
        setLogs(logsRes.data.data);
      } catch (err) {
        console.error(err);
        showToast('Failed to load automation data.', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [API_URL, token]);

  const activeAutomations = [
    { id: '1', name: 'Invoice Overdue Collection', trigger: 'Invoice Overdue', active: true, runs: 120, type: 'standard' },
    { id: '2', name: 'Lease Expiration Warning', trigger: 'Lease Expires in 60d', active: true, runs: 45, type: 'standard' },
    { id: '3', name: 'High Expense AI Audit', trigger: 'Expense > $5,000', active: true, runs: 12, type: 'ai' },
    { id: '4', name: 'Monthly Financial Review', trigger: 'Monthly Schedule', active: true, runs: 4, type: 'ai' }
  ];

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-vault-green" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <PageHeader 
          title="Automation Control Center" 
          description="Enterprise grade monitoring and execution of your background workflows."
        />
        <Link 
          href="/automation/builder"
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-vault-green text-black font-extrabold text-sm shadow-[0_0_20px_rgba(0,255,136,0.2)] hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Workflow
        </Link>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Active Workflows', value: stats?.activeWorkflows || 0, icon: Activity, color: 'text-vault-green', bg: 'bg-vault-green/10', border: 'border-vault-green/20' },
          { label: 'Recent Executions', value: stats?.recentAutomations || 0, icon: Play, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          { label: 'Failed Tasks', value: stats?.failedAutomations || 0, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
          { label: 'Hours Saved (Monthly)', value: stats?.timeSavedHours || 0, icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={cn("p-6 rounded-3xl border bg-black/40 backdrop-blur-md relative overflow-hidden", stat.border)}
          >
            <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20", stat.bg)}></div>
            <div className="flex items-center gap-4 mb-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.border, "border")}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <h3 className="text-sm font-bold text-gray-400 tracking-wider uppercase">{stat.label}</h3>
            </div>
            <p className="text-4xl font-black text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Active Automations & AI Suggestions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Workflows Graph / Cards */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><GitMerge className="w-5 h-5 text-vault-green"/> Active Workflows</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeAutomations.map((auto) => (
                <motion.div key={auto.id} whileHover={{ y: -2 }} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-vault-green/30 transition-all flex flex-col group relative overflow-hidden">
                  {auto.type === 'ai' && (
                     <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                  )}
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", auto.type === 'ai' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-vault-green/10 border-vault-green/20')}>
                      {auto.type === 'ai' ? <BrainCircuit className="w-5 h-5 text-indigo-400" /> : <Zap className="w-5 h-5 text-vault-green" />}
                    </div>
                    <ToggleRight className={cn("w-6 h-6", auto.active ? 'text-vault-green' : 'text-gray-600')} />
                  </div>
                  <h3 className="text-md font-bold text-white mb-1 group-hover:text-vault-green transition-colors relative z-10">{auto.name}</h3>
                  <p className="text-xs text-gray-400 mb-4 font-medium relative z-10 truncate">
                    <span className="font-bold text-gray-300">IF:</span> {auto.trigger}
                  </p>
                  <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                      <Play className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{auto.runs} Executions</span>
                    </div>
                    <Link href={`/automation/builder`} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                      <Settings2 className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                AI Optimization Suggestions
              </h2>
            </div>
            <div className="space-y-4 relative z-10">
              {aiSuggestions.map((rec) => (
                <div key={rec.id} className="p-4 bg-black/40 border border-indigo-500/10 rounded-2xl flex items-center justify-between group hover:bg-white/[0.02]">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{rec.title}</h4>
                    <p className="text-xs text-gray-400">{rec.description}</p>
                  </div>
                  <button className="px-4 py-2 bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-indigo-500 hover:text-black transition-colors shrink-0">
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Execution Logs Timeline */}
        <div className="lg:col-span-1">
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-gray-400"/> Execution Logs</h2>
              <button className="text-xs font-bold text-vault-green hover:underline">View All</button>
            </div>
            
            <div className="relative pl-6 border-l border-white/10 space-y-8">
              {logs.map((log, i) => {
                const isError = log.status === 'failed';
                const isAI = log.type === 'ai_action';
                const Icon = isError ? XCircle : (isAI ? Sparkles : CheckCircle2);
                const colorClass = isError ? 'text-red-400' : (isAI ? 'text-indigo-400' : 'text-vault-green');
                const bgClass = isError ? 'bg-red-500/20' : (isAI ? 'bg-indigo-500/20' : 'bg-vault-green/20');
                
                return (
                  <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="relative">
                    {/* Timeline Node */}
                    <div className={cn("absolute -left-[35px] w-7 h-7 rounded-full flex items-center justify-center border-4 border-[#0a0a0a]", bgClass)}>
                      <Icon className={cn("w-3 h-3", colorClass)} />
                    </div>
                    
                    <div className="group">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={cn("text-sm font-bold transition-colors", colorClass)}>{log.workflow}</h4>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed mb-2">{log.details}</p>
                      <span className={cn("inline-block px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border", 
                        isError ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-white/5 border-white/10 text-gray-400"
                      )}>
                        {log.type}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
          </div>
        </div>

      </div>
    </PageContainer>
  );
}

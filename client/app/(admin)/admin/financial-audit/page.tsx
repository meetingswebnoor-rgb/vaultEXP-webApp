'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { 
  ShieldCheck, AlertTriangle, Activity, Lock, Eye, Download, 
  FileWarning, RefreshCw, BarChart2, Server
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function FinancialAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [riskScan, setRiskScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        api.get('/financial/audit/logs'),
        api.get('/financial/audit/stats')
      ]);
      setLogs(logsRes.data.data.logs);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runRiskScan = async () => {
    setScanning(true);
    try {
      const res = await api.get('/financial/audit/risk');
      setRiskScan(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'WARNING': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'INFO': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <PageHeader 
          title="Financial Audit & Risk Monitoring" 
          description="Enterprise-grade tracking of all financial activity, payments, and data exports." 
        />
        <button 
          onClick={runRiskScan}
          disabled={scanning}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50"
        >
          {scanning ? <RefreshCw size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
          Run Financial Risk Scan
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Tracked Events', value: stats?.total || 0, icon: <Activity size={20} className="text-blue-400" /> },
          { label: 'Events (Last 24h)', value: stats?.last24hCount || 0, icon: <BarChart2 size={20} className="text-indigo-400" /> },
          { label: 'High Risk Warnings', value: stats?.warningCount || 0, icon: <AlertTriangle size={20} className="text-orange-400" /> },
          { label: 'Critical Breaches', value: stats?.criticalCount || 0, icon: <FileWarning size={20} className="text-red-400" /> },
        ].map((stat, idx) => (
          <div key={idx} className="bg-vault-card border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-xl">{stat.icon}</div>
            <div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</div>
              <div className="text-2xl font-display font-bold text-white mt-1">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Scanner Results */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-b from-[#0B0F13] to-vault-card border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] pointer-events-none" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-6">
              <Server size={18} className="text-indigo-400" /> Active Risk Scan
            </h3>
            
            {!riskScan ? (
              <div className="text-center py-10">
                <ShieldCheck size={40} className="mx-auto text-indigo-500/30 mb-4" />
                <p className="text-sm text-gray-400 font-medium px-4">Run a risk scan to analyze the last 7 days of financial activity for suspicious patterns.</p>
              </div>
            ) : (
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-sm font-bold text-gray-400">Risk Score</span>
                  <span className={cn(
                    "text-2xl font-display font-bold",
                    riskScan.riskLevel === 'high' ? 'text-red-500' : riskScan.riskLevel === 'medium' ? 'text-orange-500' : 'text-green-500'
                  )}>
                    {riskScan.riskScore} <span className="text-sm text-gray-500">/ 100</span>
                  </span>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase">Detected Patterns</h4>
                  {riskScan.risks.length === 0 ? (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium flex items-center gap-2">
                      <ShieldCheck size={16} /> No high-risk patterns detected.
                    </div>
                  ) : (
                    riskScan.risks.map((risk: any, i: number) => (
                      <div key={i} className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} className={risk.severity === 'high' ? 'text-red-400' : 'text-orange-400'} />
                          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{risk.type}</span>
                        </div>
                        <p className="text-sm text-gray-400">{risk.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="lg:col-span-2 bg-vault-card border border-white/5 rounded-2xl flex flex-col">
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Activity size={18} className="text-vault-green" /> Financial Event Ledger
            </h3>
            <span className="text-xs text-gray-500">Auto-updates on load</span>
          </div>

          <div className="flex-1 overflow-x-auto p-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-500">
                  <th className="p-3 text-xs font-bold uppercase tracking-wider">Time</th>
                  <th className="p-3 text-xs font-bold uppercase tracking-wider">Severity</th>
                  <th className="p-3 text-xs font-bold uppercase tracking-wider">Action</th>
                  <th className="p-3 text-xs font-bold uppercase tracking-wider w-full">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider", getSeverityStyle(log.severity))}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="p-3 text-sm font-bold text-gray-200 whitespace-nowrap">
                      {log.action.replace(/_/g, ' ')}
                    </td>
                    <td className="p-3 text-sm text-gray-400 break-words">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {logs.length === 0 && !loading && (
              <div className="p-12 text-center text-gray-500">
                <Lock size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold">No financial activity recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

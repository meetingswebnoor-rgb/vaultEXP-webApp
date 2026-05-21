'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { 
  Shield, AlertTriangle, ShieldAlert, Bot, Activity,
  Lock, Key, Download, FileWarning, Eye, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { MobileSecurityHub } from '@/components/mobile/MobileSecurityHub';

export default function SecurityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const { isMobile } = useBreakpoint();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = filterSeverity === 'ALL' ? '/api/security/logs' : `/api/security/logs?severity=${filterSeverity}`;
      const res = await api.get(url);
      setLogs(res.data.data.logs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterSeverity]);

  const runAiAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await api.post('/api/security/analyze');
      setAiAnalysis(res.data.data.analysis);
      fetchLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const triggerDemo = async () => {
    try {
      await api.post('/api/security/demo');
      fetchLogs();
    } catch (err) {
      console.error(err);
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

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN': return <Key size={16} />;
      case 'LOGIN_FAILED': return <Lock size={16} className="text-red-400" />;
      case 'FILE_DOWNLOAD': return <Download size={16} />;
      case 'PERMISSION_CHANGE': return <Eye size={16} className="text-vault-green" />;
      case 'SUSPICIOUS_ACTIVITY': return <AlertTriangle size={16} className="text-orange-400" />;
      default: return <Activity size={16} />;
    }
  };

  return (
    <PageContainer>
      {isMobile ? (
        <div className="mb-4 mt-2 px-4">
          <PageHeader 
            title="Security Center" 
            description="Your device and session management." 
          />
        </div>
      ) : (
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <PageHeader 
            title="Enterprise Security Center" 
            description="Real-time audit trails, access tracking, and AI anomaly detection." 
          />
          <div className="flex gap-3">
            <button 
              onClick={triggerDemo}
              className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Inject Demo Threats
            </button>
            <button 
              onClick={runAiAnalysis}
              disabled={analyzing}
              className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 disabled:opacity-50 font-bold text-sm px-4 py-2 rounded-xl transition-colors shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            >
              {analyzing ? <RefreshCw size={16} className="animate-spin" /> : <Bot size={16} />}
              Run AI Threat Scan
            </button>
          </div>
        </div>
      )}

      {isMobile ? (
        <MobileSecurityHub />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-6">
            <div className="bg-[#080C0F]/65 border border-indigo-500/20 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] pointer-events-none" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 relative z-10">
                <ShieldAlert size={16} className="text-indigo-400" /> Active Threat Scan
              </h3>
              
              {aiAnalysis ? (
                <div className="text-sm text-gray-300 leading-relaxed bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10 whitespace-pre-wrap relative z-10">
                  {aiAnalysis}
                </div>
              ) : (
                <div className="text-center py-6 relative z-10">
                  <Bot size={32} className="mx-auto text-indigo-500/30 mb-3" />
                  <p className="text-xs text-gray-400 font-medium">Click &quot;Run AI Threat Scan&quot; to analyze the last 24 hours of logs for suspicious activity.</p>
                </div>
              )}
            </div>

            <div className="bg-vault-card border border-white/5 rounded-2xl p-5 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Severity Filters</h3>
              <div className="space-y-2">
                {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-sm transition-colors border",
                      filterSeverity === sev ? "bg-white/10 border-white/20 text-white" : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-vault-card border border-white/5 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <Shield size={18} className="text-vault-green" /> System Audit Trail
              </h2>
              <div className="text-xs text-gray-500 font-medium">Last 100 Events</div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-black/20">
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Timestamp</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Severity</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Action</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-full">Details</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center w-fit gap-1", getSeverityStyle(log.severity))}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-200">
                          {getActionIcon(log.action)}
                          {log.action.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-300">
                        {log.details}
                        {log.user && (
                          <div className="text-xs text-gray-500 mt-1">User: {log.user.name} ({log.user.email})</div>
                        )}
                      </td>
                      <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                        {log.ipAddress && <div className="font-mono">{log.ipAddress}</div>}
                        {log.userAgent && <div className="truncate max-w-[150px]" title={log.userAgent}>{log.userAgent}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {!loading && logs.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  <Shield size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-bold">No security events found matching criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

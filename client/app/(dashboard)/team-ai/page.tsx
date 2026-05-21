'use client';
import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { Bot, AlertTriangle, FileQuestion, Clock, CheckCircle2, ChevronRight, Loader2, Sparkles, Send } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function TeamAIPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loadingDiag, setLoadingDiag] = useState(true);
  
  const [report, setReport] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState<{role: 'user' | 'ai', msg: string}[]>([]);
  const [chatting, setChatting] = useState(false);

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const fetchDiagnostics = async () => {
    try {
      const res = await api.get('/ai/team/diagnostics');
      setDiagnostics(res.data.data.diagnostics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDiag(false);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await api.post('/ai/team/report');
      setReport(res.data.data.report);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatting) return;

    const query = input;
    setChatLog(prev => [...prev, { role: 'user', msg: query }]);
    setInput('');
    setChatting(true);

    try {
      // Mocking a chat response specifically for Team AI Assistant.
      // In a real app we'd build a new endpoint for conversational team insights.
      setTimeout(() => {
        setChatLog(prev => [...prev, { role: 'ai', msg: "I've analyzed the team activity. Marketing has 3 blocked tasks, but overall momentum is up 12% week over week." }]);
        setChatting(false);
      }, 1500);
    } catch (err) {
      setChatting(false);
    }
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <PageHeader 
          title="Team AI Assistant" 
          description="Proactive team management, bottleneck detection, and executive summaries." 
        />
        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-xl text-purple-400 font-bold text-sm tracking-wide">
          <Bot size={16} /> Chief of Staff AI Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-210px)] min-h-[600px]">
        
        {/* Left Col: Diagnostics & Reporting */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Diagnostic HUD */}
          <div className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[80px] pointer-events-none" />
            
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-400" /> Active System Diagnostics
            </h3>

            {loadingDiag ? (
              <div className="h-32 flex items-center justify-center">
                <Loader2 size={24} className="text-gray-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Overdue */}
                <div className="bg-white/5 border border-red-500/20 rounded-xl p-4 hover:bg-white/[0.07] transition-colors">
                  <div className="flex items-center gap-2 mb-2 text-red-400">
                    <Clock size={16} />
                    <span className="font-bold text-sm">Overdue Tasks</span>
                  </div>
                  <p className="text-2xl font-display font-black text-white mb-2">{diagnostics?.overdueTasks.length}</p>
                  <div className="text-xs text-gray-400">Requires immediate attention</div>
                </div>

                {/* Blocked */}
                <div className="bg-white/5 border border-orange-500/20 rounded-xl p-4 hover:bg-white/[0.07] transition-colors">
                  <div className="flex items-center gap-2 mb-2 text-orange-400">
                    <AlertTriangle size={16} />
                    <span className="font-bold text-sm">Blocked</span>
                  </div>
                  <p className="text-2xl font-display font-black text-white mb-2">{diagnostics?.blockedTasks.length}</p>
                  <div className="text-xs text-gray-400">High priority, no movement</div>
                </div>

                {/* Missing */}
                <div className="bg-white/5 border border-yellow-500/20 rounded-xl p-4 hover:bg-white/[0.07] transition-colors">
                  <div className="flex items-center gap-2 mb-2 text-yellow-400">
                    <FileQuestion size={16} />
                    <span className="font-bold text-sm">Missing Files</span>
                  </div>
                  <p className="text-2xl font-display font-black text-white mb-2">{diagnostics?.missingFiles.length}</p>
                  <div className="text-xs text-gray-400">Required assets not found</div>
                </div>
              </div>
            )}
          </div>

          {/* AI Executive Report Generator */}
          <div className="bg-gradient-to-br from-vault-card to-vault-darker border border-white/5 rounded-2xl p-6 shadow-xl flex-1 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-5 relative z-10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" /> Executive Team Report
              </h3>
              <button 
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] flex items-center gap-2"
              >
                {generatingReport ? <Loader2 size={16} className="animate-spin" /> : "Generate Report"}
              </button>
            </div>

            <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-5 overflow-y-auto custom-scrollbar relative z-10">
              {report ? (
                <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {report}
                </div>
              ) : generatingReport ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                  <Loader2 size={32} className="animate-spin text-purple-500" />
                  <p className="font-bold">Aggregating CRM, Tasks, and Activity logs...</p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <Bot size={48} className="mb-4 opacity-50" />
                  <p className="font-bold">Click generate to compile cross-module team analytics.</p>
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* Right Col: Conversational Assistant */}
        <div className="lg:col-span-5 bg-[#080C0F]/65 border border-white/[0.06] rounded-[28px] overflow-hidden shadow-2xl flex flex-col relative">
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/10 blur-[100px] pointer-events-none" />
          
          <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <Bot size={20} className="text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Ask Team Assistant</h3>
              <p className="text-xs text-gray-400">Query tasks, activity, and priorities</p>
            </div>
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-5 custom-scrollbar relative z-10">
            {chatLog.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <Sparkles size={32} className="text-purple-400" />
                <p className="text-sm font-bold text-gray-400 max-w-[200px]">
                  &quot;Summarize the latest marketing discussions.&quot;
                </p>
              </div>
            ) : (
              chatLog.map((c, i) => (
                <div key={i} className={cn("flex gap-3 max-w-[85%]", c.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto')}>
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", c.role === 'user' ? "bg-white/10 text-white" : "bg-purple-500/20 text-purple-400")}>
                    {c.role === 'user' ? <CheckCircle2 size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={cn("p-3 rounded-2xl text-xs leading-relaxed", c.role === 'user' ? "bg-white/10 text-white rounded-tr-none" : "bg-purple-500/10 border border-purple-500/20 text-gray-200 rounded-tl-none")}>
                    {c.msg}
                  </div>
                </div>
              ))
            )}
            
            {chatting && (
              <div className="flex gap-3 max-w-[85%] mr-auto animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-purple-400" />
                </div>
                <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-purple-400" />
                  <span className="text-[10px] text-gray-400">Analyzing team metrics...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-5 border-t border-white/5 bg-black/40 relative z-10">
            <form onSubmit={handleChat} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about team progress or blockers..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 placeholder-gray-500"
              />
              <button 
                type="submit"
                disabled={!input.trim() || chatting}
                className="absolute right-2 p-2 bg-purple-600 rounded-lg text-white disabled:opacity-50 hover:bg-purple-500 transition-colors"
              >
                <Send size={14} />
              </button>
            </form>
          </div>

        </div>

      </div>
    </PageContainer>
  );
}

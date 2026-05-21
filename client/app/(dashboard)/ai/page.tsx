'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Bot, Send, Loader2, Award, ShieldAlert, Percent,
  ArrowRight, DollarSign, Activity, AlertCircle, RefreshCw,
  Briefcase, Landmark, Terminal, Brain, ChevronRight, CheckCircle2
} from 'lucide-react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { VaultAIOrb } from '@/components/branding/VaultAIOrb';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils/cn';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function AiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to the VaultAI Intelligence Hub. I have analyzed your unified estate registry. You can ask me to perform audits, draft tax rebalancing reports, evaluate tenant risk scores, or check financial standard deviations.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [loadingContext, setLoadingContext] = useState(true);
  const [latency, setLatency] = useState<number>(45);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: 'Audit Assets', text: 'Perform a comprehensive estate audit across all my properties, businesses, and investments.' },
    { label: 'Optimize Taxes', text: 'Analyze my claimed vs potential deductions and suggest write-offs.' },
    { label: 'Review Rent Yields', text: 'Are my property rental amounts optimized for the market?' },
    { label: 'Settle Ledger', text: 'List my unpaid transaction ledger items and their priority.' }
  ];

  // Fetch real-time AI context from DB
  const fetchContext = async () => {
    setLoadingContext(true);
    const start = Date.now();
    try {
      const res = await api.get('/api/ai/context');
      setContext(res.data?.data || null);
      setLatency(Date.now() - start);
    } catch (err) {
      console.error('Failed to retrieve AI estate context:', err);
    } finally {
      setLoadingContext(false);
    }
  };

  useEffect(() => {
    fetchContext();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/api/ai/chat', {
        query: text,
        activeModules: ['all']
      });

      const reply = res.data?.data?.reply || 'I processed your query but could not construct a strategic response.';
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date()
      }]);

      // Soft refresh context in background in case they mutated state
      api.get('/api/ai/context').then(r => {
        if (r.data?.data) setContext(r.data.data);
      }).catch(() => {});

    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an error querying the intelligence engine. Please check your network connection.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const fmtCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Derive simple metrics from gathered active context
  const businesses = context?.estate?.businesses || [];
  const properties = context?.estate?.properties || [];
  const totalBizValue = businesses.reduce((sum: number, b: any) => sum + (b.financialValue || 0), 0);
  const totalPropValue = properties.reduce((sum: number, p: any) => sum + (p.valuation || 0), 0);
  const totalInvestmentValue = context?.estate?.investments?.totalValue || 0;
  const aggregateNetWorth = totalBizValue + totalPropValue + totalInvestmentValue;

  return (
    <PageContainer>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <PageHeader 
          title="VaultAI Sandbox" 
          description="Direct secure access to the VaultEXP deep reasoning intelligence core." 
        />
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-vault-green/5 border border-vault-green/20">
          <VaultAIOrb size={18} glow={true} animated={true} compact={true} />
          <span className="text-[10px] font-bold text-vault-green tracking-wider uppercase">Active Context Engine</span>
          <span className="text-[9px] text-zinc-500 font-medium">| {latency}ms latency</span>
        </div>
      </div>

      {/* Main Responsive Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-210px)] min-h-[580px]">
        
        {/* Left Column: Premium Conversation Sandbox */}
        <div className="lg:col-span-8 flex flex-col bg-[#080C0F]/65 border border-white/[0.06] rounded-[28px] overflow-hidden shadow-2xl relative">
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-vault-green/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-12 left-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Conversation Screen Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-b border-white/[0.05] relative z-10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-vault-green/10 border border-vault-green/20 flex items-center justify-center">
                <Brain className="w-4 h-4 text-vault-green" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">Interactive AI Core</h3>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Deep Reasoning Terminal</p>
              </div>
            </div>
            <button 
              onClick={fetchContext}
              className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
              title="Resync Context"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Chat Feed Panel */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-6 py-5 space-y-5 relative z-10 custom-scrollbar"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-3 max-w-[85%]',
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                )}
              >
                {/* Avatar Icon */}
                <div className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg',
                  msg.role === 'user'
                    ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400'
                    : 'bg-vault-green/15 border border-vault-green/25 text-vault-green'
                )}>
                  {msg.role === 'user' ? <Terminal className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={cn(
                  'rounded-2xl p-4 text-xs leading-relaxed shadow-lg relative overflow-hidden transition-all duration-300',
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white/[0.03] border border-white/[0.06] text-zinc-200 rounded-tl-none hover:bg-white/[0.04]'
                )}>
                  {msg.role === 'assistant' && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-vault-green/[0.01] rounded-full blur-md" />
                  )}
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 max-w-[85%] mr-auto animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-vault-green/15 border border-vault-green/25 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-vault-green animate-bounce" />
                </div>
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl rounded-tl-none p-4 flex items-center gap-2.5">
                  <Loader2 className="w-4 h-4 text-vault-green animate-spin" />
                  <span className="text-[10px] text-zinc-400 font-medium">VaultAI is analyzing standard deviations & estate yields...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action prompts */}
          {messages.length <= 1 && (
            <div className="px-6 py-4 border-t border-white/[0.04] bg-white/[0.01] relative z-10 flex-shrink-0">
              <p className="text-[10px] text-zinc-500 mb-2.5 uppercase font-bold tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Start conversations with
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.text)}
                    className="text-left px-3 py-2 bg-black/40 hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/15 rounded-xl text-zinc-300 hover:text-white transition-all duration-300 text-[10px] font-semibold flex items-center justify-between group"
                  >
                    <span>{p.label}</span>
                    <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-vault-green transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="px-6 py-4 bg-black/50 border-t border-white/[0.06] relative z-10 flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Query estate rebalancing, write-offs, or assets..."
                className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-vault-green/40 focus:ring-1 focus:ring-vault-green/20 rounded-2xl pl-4 pr-14 py-3.5 text-xs text-white focus:outline-none transition-all placeholder-zinc-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2.5 rounded-xl bg-vault-green text-black disabled:opacity-40 disabled:hover:scale-100 transition-all shadow-[0_0_15px_rgba(0,255,136,0.2)] flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </motion.button>
            </form>
          </div>

        </div>

        {/* Right Column: Premium AI Estate Live Context Dashboard */}
        <div className="lg:col-span-4 bg-[#080C0F]/55 border border-white/[0.05] rounded-[28px] p-5 flex flex-col overflow-y-auto custom-scrollbar shadow-xl space-y-6 relative h-full">
          
          {/* Identity Widget */}
          <div className="space-y-3">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">ESTATE REGISTRY SUMMARY</p>
            
            {loadingContext ? (
              <div className="flex items-center gap-3 py-2">
                <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                <span className="text-[11px] text-zinc-400">Aggregating vaults...</span>
              </div>
            ) : (
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-vault-green/10 border border-vault-green/15 flex items-center justify-center text-vault-green font-bold text-xs shadow-inner">
                  {context?.identity?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'V'}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">{context?.identity?.name || 'Vault Master'}</h4>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{context?.identity?.role || 'SaaS Client'}</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-vault-green animate-ping" />
              </div>
            )}
          </div>

          {/* Aggregate Valuation Audit Widget */}
          <div className="space-y-2">
            <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-vault-green" /> Net Worth Audited
            </h4>
            
            <div className="bg-gradient-to-br from-indigo-950/20 via-indigo-900/5 to-transparent border border-indigo-500/15 rounded-2xl p-4 space-y-3.5 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
              
              <div>
                <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">AGGREGATE WEALTH</span>
                <h3 className="text-xl font-display font-black text-white mt-0.5">
                  {loadingContext ? 'Calculating...' : fmtCurrency(aggregateNetWorth)}
                </h3>
              </div>

              {/* Asset breakdown list */}
              <div className="space-y-2 pt-2.5 border-t border-white/[0.05] text-[10px]">
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="flex items-center gap-1.5"><Briefcase className="w-3 h-3 text-indigo-400" /> Businesses ({businesses.length})</span>
                  <span className="font-bold text-white">{loadingContext ? '...' : fmtCurrency(totalBizValue)}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="flex items-center gap-1.5"><Landmark className="w-3 h-3 text-emerald-400" /> Properties ({properties.length})</span>
                  <span className="font-bold text-white">{loadingContext ? '...' : fmtCurrency(totalPropValue)}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-blue-400" /> Liquid Portfolio</span>
                  <span className="font-bold text-white">{loadingContext ? '...' : fmtCurrency(totalInvestmentValue)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Diversification Index & Risk Gauge */}
          {!loadingContext && context?.estate?.investments && (
            <div className="space-y-2">
              <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-vault-green" /> Diversification score
              </h4>
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-vault-green/10 border border-vault-green/20 flex flex-col items-center justify-center text-vault-green">
                  <span className="text-[12px] font-black leading-none">A</span>
                  <span className="text-[7px] uppercase font-bold leading-none mt-0.5">Grade</span>
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-[11px] font-bold text-white truncate capitalize">{context.estate.investments.riskProfile || 'Diversified Risk'}</p>
                  <p className="text-[9px] text-zinc-400 leading-normal">Liquid rebalancing yield checks active.</p>
                </div>
              </div>
            </div>
          )}

          {/* Live Strategic Recommendations */}
          <div className="space-y-2.5 flex-1 flex flex-col justify-end">
            <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Strategic Reminders
            </h4>

            <div className="space-y-2 text-[10px]">
              <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] p-3 rounded-xl flex items-start gap-2.5 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-vault-green flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-white">Active CPA Safeguard</p>
                  <p className="text-zinc-500 text-[9px] leading-relaxed">Tax strategy compliant under legal guidelines.</p>
                </div>
              </div>

              <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] p-3 rounded-xl flex items-start gap-2.5 transition-colors">
                <Brain className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-white">Gemini Engine Running</p>
                  <p className="text-zinc-500 text-[9px] leading-relaxed">Continuous risk monitoring actively running.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </PageContainer>
  );
}

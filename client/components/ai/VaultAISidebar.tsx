'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, Send, Bot, Terminal, RefreshCw, ShieldAlert,
  ArrowRight, Landmark, FileText, TrendingUp, Percent, Lightbulb, Play, Mic, MicOff, Activity
} from 'lucide-react';
import { useAppShell } from '@/components/shell/AppShellContext';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils/cn';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export function VaultAISidebar() {
  const { aiSidebarOpen, closeAISidebar } = useAppShell();
  const pathname = usePathname();
  const router   = useRouter();

  const [query, setQuery]       = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: 'Hello! I am VaultAI, your estate planning strategist. Ask me to analyze investments, identify write-offs, review leases, or settle invoices.', timestamp: new Date() }
  ]);
  const [loading, setLoading]   = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef              = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);
  const recognitionRef          = useRef<any>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiSidebarOpen]);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setQuery(prev => prev + ' ' + finalTranscript);
        } else if (interimTranscript) {
          // Could display interim somewhere, but let's just stick to final for stability
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setQuery(''); // clear query on new speech
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Contextual prompts based on active pathname
  const getContextualCommands = () => {
    if (pathname.includes('/property')) {
      return [
        { label: 'Summarize Leases', query: 'Show me expiring leases' },
        { label: 'Check Rent Arrears', query: 'List tenants with overdue rent' }
      ];
    }
    if (pathname.includes('/investment')) {
      return [
        { label: 'Audit Holdings', query: 'Check my investment diversification score' },
        { label: 'Diversification Tips', query: 'How can I hedge my capital gains exposure?' }
      ];
    }
    if (pathname.includes('/tax')) {
      return [
        { label: 'Audit Write-offs', query: 'Identify eligible business deductions' },
        { label: 'IRS Codes Guidance', query: 'Cite general legal tax strategy codes' }
      ];
    }
    if (pathname.includes('/wallet')) {
      return [
        { label: 'Settle Invoices', query: 'List unpaid bills in my transactional ledger' },
        { label: 'Balance Statement', query: 'Show this month\'s expense trajectory' }
      ];
    }
    // Default commands
    return [
      { label: 'Optimize Taxes', query: 'Analyze unclaimed deductions' },
      { label: 'Settle Bills', query: 'Show unpaid corporate invoices' },
      { label: 'Lease Status', query: 'Are there any leases expiring soon?' }
    ];
  };

  const handleSend = async (textToSend?: string) => {
    const promptText = textToSend || query;
    if (!promptText.trim()) return;

    const userMsg: Message = { sender: 'user', text: promptText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setQuery('');
    setLoading(true);

    try {
      const activeModule = pathname.split('/')[1] || 'all';
      const res = await api.post('/api/ai/chat', {
        query: promptText,
        activeModules: [activeModule]
      });

      const reply = res.data?.data?.reply || 'I processed your query but could not construct a strategic response.';
      setMessages(prev => [...prev, { sender: 'ai', text: reply, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'ai', text: 'I encountered an error querying the intelligence engine. Please check your credentials.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCommandClick = (cmd: string) => {
    handleSend(cmd);
  };

  const handleQuickAction = (actionType: string) => {
    if (actionType === 'ask_ai') {
      inputRef.current?.focus();
    } else if (actionType === 'finance') {
      handleSend('Analyze my current wallet balances and investment portfolio, and provide a high-level summary of my financial health.');
    } else if (actionType === 'docs') {
      handleSend('Summarize the most recently uploaded contracts and leases, highlighting any impending deadlines.');
    } else if (actionType === 'reminder') {
      handleSend('Create a new reminder to review my financial audit next week.');
    } else if (actionType === 'automation') {
      handleSend('Trigger the "Month-End Tax Audit" automation workflow now.');
    }
  };

  return (
    <AnimatePresence>
      {aiSidebarOpen && (
        <>
          {/* Backdrop (mobile/tablet only) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeAISidebar}
          />

          {/* Assistant Sidebar Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className={cn(
              'fixed top-0 right-0 bottom-0 z-50 flex flex-col',
              'bg-[#090D11]/90 backdrop-blur-[24px] border-l border-white/[0.06]',
              'w-full sm:w-[440px] shadow-[0_0_50px_rgba(0,0,0,0.8)]'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] relative z-10">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Sparkles className="w-5 h-5 text-vault-green animate-pulse" />
                  <div className="absolute inset-0 bg-vault-green/20 blur-md rounded-full -z-10" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">VaultAI Strategic Assistant</h3>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">ESTATE AUDITOR</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={closeAISidebar}
                className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Quick Actions Ribbon */}
            <div className="px-5 py-3.5 bg-white/[0.01] border-b border-white/[0.05] flex gap-2 overflow-x-auto custom-scrollbar flex-shrink-0 hide-scrollbar">
              {[
                { label: 'Ask AI', type: 'ask_ai', icon: Terminal },
                { label: 'Finance Summary', type: 'finance', icon: Landmark },
                { label: 'Doc Summary', type: 'docs', icon: FileText },
                { label: 'Add Reminder', type: 'reminder', icon: Sparkles },
                { label: 'Run Automation', type: 'automation', icon: Activity }
              ].map((btn) => {
                const Icon = btn.icon;
                return (
                  <button
                    key={btn.type}
                    onClick={() => handleQuickAction(btn.type)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-300 text-[11px] font-bold tracking-wide flex items-center gap-1.5 flex-shrink-0 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-vault-green" />
                    {btn.label}
                  </button>
                );
              })}
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={cn('flex gap-3 max-w-[85%]', msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto')}>
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                    msg.sender === 'user' ? 'bg-indigo-600/20 border border-indigo-500/30' : 'bg-vault-green/10 border border-vault-green/20'
                  )}>
                    {msg.sender === 'user' ? <Terminal className="w-3.5 h-3.5 text-indigo-400" /> : <Bot className="w-3.5 h-3.5 text-vault-green" />}
                  </div>
                  <div className={cn(
                    'rounded-2xl p-3.5 text-xs leading-relaxed shadow-lg',
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white/[0.03] border border-white/[0.06] text-zinc-200 rounded-tl-none'
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="w-7 h-7 rounded-lg bg-vault-green/10 border border-vault-green/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-vault-green animate-pulse" />
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-vault-green animate-spin" />
                    <span className="text-[10px] text-zinc-400">Constructing strategic recommendations...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Context Commands */}
            <div className="px-5 py-3 border-t border-white/[0.05] space-y-2 flex-shrink-0">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Contextual Prompts
              </p>
              <div className="flex gap-2 flex-wrap">
                {getContextualCommands().map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => handleCommandClick(cmd.query)}
                    className="px-2.5 py-1.5 bg-black/40 border border-white/[0.06] hover:border-white/20 text-zinc-300 hover:text-white text-[10px] rounded-lg text-left transition-colors flex items-center gap-1"
                  >
                    <Play className="w-2.5 h-2.5 text-vault-green fill-vault-green" /> {cmd.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="px-5 py-4 border-t border-white/[0.06] flex gap-2 items-center flex-shrink-0 bg-vault-darker/50">
              {/* Voice Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleListen}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all shadow-lg",
                  isListening 
                    ? "bg-red-500/20 text-red-400 border border-red-500/40" 
                    : "bg-white/[0.03] text-zinc-400 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white"
                )}
              >
                {isListening ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
              </motion.button>

              {/* Text Input / Audio Visualizer */}
              <div className="flex-1 relative flex items-center bg-white/[0.02] border border-white/[0.08] focus-within:border-vault-green/50 rounded-xl transition-colors overflow-hidden">
                {isListening ? (
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-vault-dark">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ height: ['20%', '80%', '20%'] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1, ease: 'easeInOut' }}
                        className="w-1 bg-vault-green rounded-full"
                      />
                    ))}
                    <span className="text-[10px] text-vault-green font-bold ml-2 animate-pulse">Listening...</span>
                  </div>
                ) : null}
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isListening ? "" : "Ask VaultAI..."}
                  className="w-full bg-transparent px-3.5 py-3 text-xs text-white outline-none placeholder-zinc-500"
                  disabled={isListening}
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => handleSend()}
                className="w-10 h-10 rounded-xl bg-vault-green text-black flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-90 shadow-[0_0_15px_rgba(0,255,136,0.2)]"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

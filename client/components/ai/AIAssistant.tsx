'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAIChat, getLoadingMessage } from '@/hooks/useAI';

/**
 * AIAssistant — Floating AI Chat Widget
 *
 * FIXES APPLIED:
 *  - Was sending { message } → now sends { query } via useAIChat hook
 *  - Added proper loading states with cycling messages
 *  - Graceful fallback messages on error
 *  - Enter key handling works correctly
 *  - Scroll to bottom on new messages
 */
export function AIAssistant() {
  const [isOpen, setIsOpen]   = useState(false);
  const [input,  setInput]    = useState('');
  const pathname              = usePathname();
  const isClientPortal        = pathname?.startsWith('/client');
  const messagesEndRef        = useRef<HTMLDivElement>(null);
  const inputRef              = useRef<HTMLInputElement>(null);

  const { messages, isLoading, loadingState, sendMessage } = useAIChat({
    modules: ['all'],
    welcomeMessage: `Hi! I'm VaultAI, your intelligent business assistant. Ask me about your invoices, business performance, properties, investments, or any VaultEXP feature.`
  });

  const quickActions = [
    'How much rent is overdue?',
    "Show this month's expenses",
    'Summarize my business performance',
    'What invoices are unpaid?',
    'Show upcoming renewals'
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: string) => {
    if (!isLoading) sendMessage(action);
  };

  const loadingMsg = getLoadingMessage(loadingState);

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl text-white flex items-center justify-center border border-white/10 backdrop-blur-sm"
        style={{ backgroundColor: 'var(--ws-primary, #2563EB)' }}
        title="Open VaultAI Assistant"
        id="vault-ai-assistant-trigger"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      {/* AI Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-full max-w-sm sm:max-w-md bg-[#0A0F14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl"
            style={{ height: '560px', maxHeight: 'calc(100vh - 120px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.03] flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">VaultAI</h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    Your personal financial AI
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                id="vault-ai-assistant-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-white rounded-br-none'
                        : 'bg-white/[0.06] text-zinc-200 rounded-bl-none border border-white/[0.06]'
                    }`}
                    style={msg.role === 'user' ? { backgroundColor: 'var(--ws-primary, #2563EB)' } : undefined}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.06] border border-white/[0.06] text-zinc-300 rounded-2xl rounded-bl-none px-4 py-2.5 flex items-center gap-2 text-sm">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400 flex-shrink-0" />
                    <span className="text-xs text-zinc-400">{loadingMsg || 'VaultAI is thinking...'}</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions (shown early in conversation) */}
            {messages.length < 3 && !isLoading && (
              <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.02] flex-shrink-0">
                <p className="text-xs text-zinc-500 mb-2 font-medium">Quick Actions</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickAction(action)}
                      className="text-xs px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] hover:border-white/20 rounded-full text-zinc-300 hover:text-white transition-all duration-200"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 bg-[#080C10] border-t border-white/10 flex-shrink-0">
              <div className="relative flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask VaultAI anything..."
                  disabled={isLoading}
                  className="flex-1 bg-white/[0.05] border border-white/[0.09] focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all placeholder-zinc-600 disabled:opacity-60"
                  id="vault-ai-assistant-input"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:hover:scale-100 transition-all shadow-lg flex-shrink-0"
                  style={{ backgroundColor: 'var(--ws-primary, #2563EB)' }}
                  id="vault-ai-assistant-send"
                >
                  {isLoading
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

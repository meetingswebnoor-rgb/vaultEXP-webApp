'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, FileText, CreditCard, BarChart3, Bot, User } from 'lucide-react';
import { api } from '@/lib/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export default function ClientAIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'intro',
    role: 'ai',
    content: "Hi! I'm Vault AI, your personal financial and legal assistant. How can I help you today? You can ask me to explain a recent charge, summarize a document, or break down your financial statements."
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (query: string) => {
    if (!query.trim() || isLoading) return;
    
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: query }]);
    setIsLoading(true);

    try {
      // Simulate API call to our secure client AI endpoint
      const res = await api.post('/api/client/ai/chat', { message: query });
      if (res.data?.success) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: res.data.data.reply }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: "I'm having trouble analyzing your records right now. Please try again." }]);
      }
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: "I'm sorry, I encountered an error while accessing your financial context." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { icon: FileText, label: 'Summarize my latest Master Services Agreement', query: 'Can you summarize my latest Master Services Agreement?' },
    { icon: CreditCard, label: 'Explain my outstanding invoices', query: 'Please explain the charges on my outstanding invoices.' },
    { icon: BarChart3, label: 'Break down my Q1 Financial Report', query: 'Can you break down the key takeaways from my Q1 Financial Report?' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] w-full max-w-5xl mx-auto p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <Sparkles className="text-[var(--brand-primary,#2563EB)]" /> Vault AI Assistant
        </h1>
        <p className="text-gray-500 mt-2">Your dedicated, context-aware AI for financial and document analysis.</p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col relative">
        
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-white'
              }`} style={msg.role === 'ai' ? { backgroundColor: 'var(--brand-primary, #2563EB)' } : {}}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-6 py-4 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gray-100 text-gray-900 rounded-tr-sm'
                  : 'bg-blue-50/50 text-gray-800 border border-blue-100 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm text-white" style={{ backgroundColor: 'var(--brand-primary, #2563EB)' }}>
                <Bot size={20} />
              </div>
              <div className="max-w-[75%] rounded-2xl px-6 py-4 text-sm bg-blue-50/50 border border-blue-100 rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions (only show if few messages) */}
        {messages.length <= 2 && !isLoading && (
          <div className="px-6 pb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Suggested Queries</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSend(action.query)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors"
                >
                  <action.icon size={14} className="text-[var(--brand-primary,#2563EB)]" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Box */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex gap-3 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm focus-within:border-[var(--brand-primary,#2563EB)] focus-within:ring-2 focus-within:ring-blue-100 transition-all"
          >
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask Vault AI about your finances, documents, or reports..."
              className="flex-1 bg-transparent border-none outline-none px-4 text-sm text-gray-900 placeholder:text-gray-400"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 flex items-center justify-center rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              style={{ backgroundColor: 'var(--brand-primary, #2563EB)' }}
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-[10px] text-center text-gray-400 mt-3">
            Vault AI securely accesses your authorized documents and financial records. AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}

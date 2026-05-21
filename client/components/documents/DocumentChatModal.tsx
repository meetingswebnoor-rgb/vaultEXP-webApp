'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, BrainCircuit, FileText, Loader2 } from 'lucide-react';
import { VaultAIOrb } from '@/components/branding/VaultAIOrb';
import { cn } from '@/lib/utils/cn';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

interface DocumentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentIds: string[]; // Pass array for multi-document chat
  documentNames: string[]; // For UI display context
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  citations?: string[];
}

export function DocumentChatModal({ isOpen, onClose, documentIds, documentNames }: DocumentChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: `Hello. I am VaultAI. I have scanned the selected documents (${documentNames.join(', ')}). You can ask me anything about their contents, dates, amounts, or summaries.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = useAuthStore(s => s.token);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset chat if context changes
  useEffect(() => {
    if (isOpen) {
      setMessages([{
        id: 'welcome',
        role: 'ai',
        content: `Hello. I am VaultAI. I have securely loaded ${documentNames.length} document(s) into my context window. What would you like to know?`
      }]);
    }
  }, [isOpen, documentNames]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/documents/chat`,
        { documentIds, query: userMsg.content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: res.data.answer,
        citations: res.data.citations
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'I encountered a secure connection error while trying to read the documents. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl h-[80vh] flex flex-col bg-[#0A0F14]/95 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <VaultAIOrb size={28} glow animated compact />
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  VaultAI Secure Chat
                  <span className="px-2 py-0.5 rounded text-[9px] uppercase tracking-widest bg-vault-green/10 text-vault-green border border-vault-green/20">End-to-End Encrypted</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <FileText size={10} /> Context: {documentNames.length} Document(s)
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors bg-white/[0.05] rounded-xl hover:bg-white/10">
              <X size={18} />
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                  msg.role === 'user' ? "bg-white/10 text-white" : "bg-vault-green/10 text-vault-green border border-vault-green/20"
                )}>
                  {msg.role === 'user' ? <User size={14} /> : <BrainCircuit size={14} />}
                </div>

                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-white/[0.08] text-white rounded-tr-sm" 
                    : "bg-vault-green/5 text-gray-300 border border-vault-green/10 rounded-tl-sm shadow-inner"
                )}>
                  {msg.content}
                  
                  {/* Citations */}
                  {msg.role === 'ai' && msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-vault-green/10">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-vault-green/60 mb-2">Sources Referenced</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.citations.map((cite, i) => (
                          <span key={i} className="flex items-center gap-1 text-[10px] text-gray-400 bg-black/40 px-2 py-1 rounded-md border border-white/5">
                            <FileText size={10} /> {cite}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[85%] mr-auto">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-vault-green/10 text-vault-green border border-vault-green/20">
                  <Loader2 size={14} className="animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-vault-green/5 border border-vault-green/10 rounded-tl-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-vault-green animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-vault-green animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-vault-green animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-white/[0.01]">
            <div className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl overflow-hidden focus-within:border-vault-green focus-within:ring-1 focus-within:ring-vault-green transition-all">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about amounts, dates, summaries, or terms..."
                className="flex-1 bg-transparent border-none text-sm text-white px-5 py-4 outline-none placeholder-gray-600"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="mr-2 p-2.5 rounded-xl bg-vault-green text-black disabled:opacity-50 disabled:bg-white/10 disabled:text-gray-500 hover:brightness-110 transition-all"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-600 mt-3 uppercase tracking-wider">
              VaultAI uses end-to-end encryption. Your documents are never used for public training.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

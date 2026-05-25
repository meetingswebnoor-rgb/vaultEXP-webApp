'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { FileText, CreditCard, CheckSquare, Sparkles, Send, Download, Activity, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function ClientDashboard() {
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([]);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['clientDashboard'],
    queryFn: async () => {
      const res = await api.get('/client/dashboard');
      return res.data.data;
    }
  });

  const aiMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await api.post('/client/ai/chat', { message });
      return res.data.data.reply;
    },
    onSuccess: (reply) => {
      setChatHistory(prev => [...prev, { role: 'ai', content: reply }]);
    },
    onError: () => {
      setChatHistory(prev => [...prev, { role: 'ai', content: "Taliv is still training this AI system. Advanced intelligence features will be available soon." }]);
    }
  });

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    setChatHistory(prev => [...prev, { role: 'user', content: chatMessage }]);
    aiMutation.mutate(chatMessage);
    setChatMessage('');
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-12 h-12 border-4 border-vault-emerald/30 border-t-vault-emerald rounded-full"
        />
      </div>
    );
  }

  const data = dashboardData || { outstandingInvoicesCount: 0, totalOutstandingAmount: 0, pendingApprovals: 0, recentDocuments: [] };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard hoverEffect variants={itemVariants} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20"><CreditCard size={20} /></div>
            <span className="text-sm font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">{data.outstandingInvoicesCount} Due</span>
          </div>
          <p className="text-gray-400 text-sm mb-1 font-medium">Outstanding Balance</p>
          <p className="text-4xl font-display font-bold text-white tracking-tight">${data.totalOutstandingAmount.toLocaleString()}</p>
          <button className="mt-6 w-full py-2.5 bg-white/5 text-white rounded-xl text-sm font-bold hover:bg-white/10 border border-white/10 transition-all hover:border-white/20 group">
            Settle Balance <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </button>
        </GlassCard>

        <GlassCard hoverEffect variants={itemVariants} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-vault-cyan/10 text-vault-cyan rounded-xl border border-vault-cyan/20"><CheckSquare size={20} /></div>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="w-2 h-2 rounded-full bg-vault-cyan shadow-[0_0_8px_#00E5FF]" />
          </div>
          <p className="text-gray-400 text-sm mb-1 font-medium">Pending Approvals</p>
          <p className="text-4xl font-display font-bold text-white tracking-tight">{data.pendingApprovals}</p>
          <button className="mt-6 w-full py-2.5 bg-vault-cyan/10 text-vault-cyan rounded-xl text-sm font-bold hover:bg-vault-cyan/20 border border-vault-cyan/20 transition-all group">
            Review Items <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </button>
        </GlassCard>
        
        <GlassCard hoverEffect variants={itemVariants} className="p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-vault-emerald/10 rounded-full blur-2xl group-hover:bg-vault-emerald/20 transition-all duration-500" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-vault-emerald/10 text-vault-emerald rounded-xl border border-vault-emerald/20"><Activity size={20} /></div>
            <span className="text-sm font-bold text-vault-emerald bg-vault-emerald/10 px-3 py-1 rounded-full border border-vault-emerald/20">System Nominal</span>
          </div>
          <p className="text-gray-400 text-sm mb-1 font-medium relative z-10">Workspace Status</p>
          <p className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-vault-emerald to-vault-cyan tracking-tight relative z-10">Active</p>
          <button className="mt-6 w-full py-2.5 bg-vault-emerald/10 text-vault-emerald rounded-xl text-sm font-bold hover:bg-vault-emerald/20 border border-vault-emerald/20 transition-all group relative z-10">
            View Analytics <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </button>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Recent Documents Table */}
        <GlassCard variants={itemVariants} className="lg:col-span-3 flex flex-col h-[550px]">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg text-gray-300"><FileText size={18} /></div> 
              Recent Intelligence
            </h3>
            <button className="text-sm font-semibold text-vault-emerald hover:text-[#00FFAA] transition-colors">View All</button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {data.recentDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                <FileText size={48} className="opacity-20" />
                <p>No intelligence files intercepted yet.</p>
              </div>
            ) : (
              <ul className="space-y-2 p-2">
                <AnimatePresence>
                  {data.recentDocuments.map((doc: any, i: number) => (
                    <motion.li 
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10 flex items-center justify-between transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-vault-obsidian rounded-xl text-gray-500 border border-white/5 group-hover:border-vault-emerald/30 group-hover:text-vault-emerald shadow-sm transition-all">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{doc.name}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{new Date(doc.date).toLocaleDateString()} • {doc.type}</p>
                        </div>
                      </div>
                      <button className="text-gray-500 hover:text-vault-emerald hover:bg-vault-emerald/10 p-2.5 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Download size={18} />
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </GlassCard>

        {/* Vault AI Client Assistant */}
        <GlassCard variants={itemVariants} className="lg:col-span-2 flex flex-col h-[550px] relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-vault-cyan/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-white/5 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-vault-cyan blur-md opacity-40 animate-pulse-slow" />
              <div className="relative p-2.5 bg-vault-obsidian border border-vault-cyan/30 rounded-xl text-vault-cyan">
                <Sparkles size={20} />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Vault AI</h3>
              <p className="text-xs text-vault-cyan font-mono tracking-wide">SECURE LINK ESTABLISHED</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-vault-obsidian/40 relative z-10">
            {chatHistory.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mt-10"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-vault-cyan/10 rounded-full flex items-center justify-center border border-vault-cyan/20">
                  <Sparkles size={24} className="text-vault-cyan" />
                </div>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">
                  I&apos;m your secure intelligence assistant. Query your vault for contracts, invoices, and analytics.
                </p>
              </motion.div>
            )}
            
            <AnimatePresence>
              {chatHistory.map((msg, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm font-medium leading-relaxed shadow-lg ${
                    msg.role === 'user' 
                      ? 'bg-vault-emerald text-vault-obsidian rounded-tr-sm' 
                      : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm backdrop-blur-md'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              
              {aiMutation.isPending && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 flex gap-2 items-center backdrop-blur-md">
                    <div className="w-2 h-2 bg-vault-cyan rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-vault-cyan rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-vault-cyan rounded-full animate-bounce delay-200" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <form onSubmit={handleSendChat} className="p-4 border-t border-white/5 bg-vault-obsidian/80 backdrop-blur-xl relative z-10">
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Initialize query..." 
                className="w-full pl-5 pr-14 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-vault-cyan focus:border-vault-cyan text-sm text-white placeholder-gray-500 transition-all font-mono"
              />
              <button 
                type="submit"
                disabled={!chatMessage.trim() || aiMutation.isPending}
                className="absolute right-2 p-2.5 bg-vault-cyan text-vault-obsidian hover:bg-[#00FFAA] rounded-lg disabled:opacity-50 disabled:bg-white/10 disabled:text-gray-500 transition-all shadow-[0_0_10px_rgba(0,229,255,0.3)] disabled:shadow-none"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </motion.div>
  );
}

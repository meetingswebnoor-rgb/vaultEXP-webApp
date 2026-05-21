'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Send, ArrowLeft, Bot, Sparkles, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminTicketDetail() {
  const params = useParams();
  const ticketId = params.id as string;
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [summary, setSummary] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['adminTicket', ticketId],
    queryFn: async () => {
      const res = await api.get(`/admin/support/${ticketId}`);
      return res.data.data;
    },
    refetchInterval: 5000
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      return api.post(`/admin/support/${ticketId}/messages`, { content: newMessage, isInternal: false });
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['adminTicket', ticketId] });
    }
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      return api.patch(`/admin/support/${ticketId}/status`, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminTicket', ticketId] })
  });

  const aiSuggest = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/admin/support/${ticketId}/ai/suggest`);
      return res.data.data;
    },
    onSuccess: (data) => setNewMessage(data)
  });

  const aiSummarize = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/admin/support/${ticketId}/ai/summarize`);
      return res.data.data;
    },
    onSuccess: (data) => setSummary(data)
  });

  if (isLoading) return <div className="p-8 text-gray-400">Loading workspace...</div>;
  if (!ticket) return <div className="p-8 text-red-400">Ticket not found.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto w-full h-[calc(100vh-80px)] flex flex-col pb-32">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/tickets" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Queue
        </Link>
        <div className="flex gap-2">
          {ticket.status !== 'resolved' && (
            <button 
              onClick={() => updateStatus.mutate('resolved')}
              className="px-4 py-2 bg-vault-green/10 text-vault-green hover:bg-vault-green/20 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
            >
              <CheckCircle size={16} /> Mark Resolved
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Main Chat Thread */}
        <div className="lg:col-span-2 flex flex-col bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden relative">
          <div className="p-4 border-b border-white/[0.05] bg-white/[0.01]">
            <h1 className="text-xl font-bold text-white tracking-tight">{ticket.subject}</h1>
            <p className="text-gray-400 text-xs mt-1">User: {ticket.user?.name} ({ticket.user?.email})</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {ticket.messages?.map((msg: any) => {
              const isSupport = msg.sender.role === 'ADMIN' || msg.sender.role === 'SUPER_ADMIN';
              return (
                <div key={msg.id} className={`flex ${isSupport ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] flex items-end gap-3 ${isSupport ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      isSupport ? 'bg-vault-green/20 text-vault-green border border-vault-green/30' : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}>
                      {isSupport ? 'ME' : msg.sender.name[0].toUpperCase()}
                    </div>
                    
                    <div>
                      <div className={`flex items-center gap-2 mb-1 px-1 ${isSupport ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[10px] text-gray-500">{isSupport ? 'You (Agent)' : 'Customer'}</span>
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isSupport 
                          ? 'bg-vault-green/10 text-vault-green rounded-br-sm border border-vault-green/20' 
                          : 'bg-white/5 text-gray-200 rounded-bl-sm border border-white/10'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/[0.01] border-t border-white/[0.05]">
            <form 
              onSubmit={(e) => { e.preventDefault(); sendMessage.mutate(); }}
              className="relative flex flex-col gap-3"
            >
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your reply to the customer..."
                className="w-full bg-[#0A0F14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-vault-green/50 resize-none"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (newMessage.trim()) sendMessage.mutate();
                  }
                }}
              />
              <div className="flex justify-between items-center">
                <button 
                  type="button"
                  onClick={() => aiSuggest.mutate()}
                  disabled={aiSuggest.isPending}
                  className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles size={14} /> {aiSuggest.isPending ? 'Drafting...' : 'AI Suggest Reply'}
                </button>
                <button 
                  type="submit"
                  disabled={!newMessage.trim() || sendMessage.isPending}
                  className="px-6 py-2 bg-vault-green hover:bg-vault-green/90 text-black font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Send size={16} /> Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* AI Copilot Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-b from-purple-500/5 to-transparent border border-purple-500/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none" />
            
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Bot className="text-purple-400" size={20} /> AI Copilot
            </h3>
            
            <button
              onClick={() => aiSummarize.mutate()}
              disabled={aiSummarize.isPending}
              className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-colors mb-4 flex items-center gap-3 disabled:opacity-50"
            >
              <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
                <FileText size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Summarize Thread</p>
                <p className="text-xs text-gray-500 mt-0.5">Generate a quick TL;DR</p>
              </div>
            </button>

            {summary && (
              <div className="p-4 bg-[#0A0F14] border border-purple-500/20 rounded-xl text-sm text-gray-300 leading-relaxed shadow-inner">
                {summary}
              </div>
            )}
          </div>

          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Ticket Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="text-white capitalize">{ticket.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Priority</span>
                <span className="text-white capitalize">{ticket.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category</span>
                <span className="text-white capitalize">{ticket.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-white">{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Send, ArrowLeft, Bot } from 'lucide-react';
import Link from 'next/link';

export default function TicketChat() {
  const params = useParams();
  const ticketId = params.id as string;
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      const res = await api.get(`/tickets/${ticketId}`);
      return res.data.data;
    },
    refetchInterval: 5000 // Poll every 5s for new messages
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      return api.post(`/tickets/${ticketId}/messages`, { content: newMessage });
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
    }
  });

  if (isLoading) return <div className="p-8 text-gray-400">Loading thread...</div>;
  if (!ticket) return <div className="p-8 text-red-400">Ticket not found.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto w-full pb-32 h-[calc(100vh-80px)] flex flex-col">
      <Link href="/support" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit mb-6">
        <ArrowLeft size={16} /> Back to Support
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{ticket.subject}</h1>
          <p className="text-gray-400 text-sm mt-1">Ticket ID: {ticket.id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
          ticket.status === 'open' ? 'bg-yellow-500/10 text-yellow-500' :
          ticket.status === 'resolved' || ticket.status === 'closed' ? 'bg-vault-green/10 text-vault-green' :
          'bg-blue-500/10 text-blue-400'
        }`}>
          {ticket.status}
        </span>
      </div>

      {/* Chat Thread */}
      <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {ticket.messages?.map((msg: any) => {
            const isAdmin = msg.sender.role === 'ADMIN' || msg.sender.role === 'SUPER_ADMIN';
            return (
              <div key={msg.id} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] flex items-end gap-3 ${isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
                  
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isAdmin ? 'bg-vault-green/20 text-vault-green border border-vault-green/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {isAdmin ? <Bot size={14} /> : msg.sender.name[0].toUpperCase()}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[10px] text-gray-500">{isAdmin ? 'Support Team' : 'You'}</span>
                      <span className="text-[10px] text-gray-600">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      isAdmin 
                        ? 'bg-white/5 text-gray-200 rounded-bl-sm' 
                        : 'bg-blue-500/10 text-blue-100 rounded-br-sm border border-blue-500/20'
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
        {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
          <div className="p-4 bg-white/[0.01] border-t border-white/[0.05]">
            <form 
              onSubmit={(e) => { e.preventDefault(); sendMessage.mutate(); }}
              className="relative flex items-end gap-2"
            >
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 resize-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (newMessage.trim()) sendMessage.mutate();
                  }
                }}
              />
              <button 
                type="submit"
                disabled={!newMessage.trim() || sendMessage.isPending}
                className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LifeBuoy, Plus, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function UserSupportCenter() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['userTickets'],
    queryFn: async () => {
      const res = await api.get('/tickets');
      return res.data.data;
    }
  });

  const createTicket = useMutation({
    mutationFn: async () => {
      return api.post('/tickets', { subject, description });
    },
    onSuccess: () => {
      setIsModalOpen(false);
      setSubject('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['userTickets'] });
    }
  });

  return (
    <div className="p-8 max-w-5xl mx-auto w-full pb-32">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <LifeBuoy className="text-blue-400" /> Support Center
          </h1>
          <p className="text-gray-400 mt-2">Create new tickets, track existing issues, and chat with our enterprise support team.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-vault-green text-black font-bold rounded-xl flex items-center gap-2 hover:bg-vault-green/90 transition-colors"
        >
          <Plus size={18} /> New Ticket
        </button>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading support tickets...</div>
        ) : tickets?.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 font-bold">No tickets yet</p>
            <p className="text-gray-500 text-sm mt-2">You haven&apos;t submitted any support requests.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {tickets?.map((ticket: any) => (
              <Link key={ticket.id} href={`/support/${ticket.id}`} className="block hover:bg-white/[0.02] transition-colors p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{ticket.subject}</h3>
                    <p className="text-sm text-gray-400 line-clamp-1">{ticket.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ticket.status === 'open' ? 'bg-yellow-500/10 text-yellow-500' :
                        ticket.status === 'resolved' || ticket.status === 'closed' ? 'bg-vault-green/10 text-vault-green' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {ticket.status}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} /> {new Date(ticket.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0A0F14]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111820] border border-white/10 rounded-2xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Create Support Ticket</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-vault-green/50"
                  placeholder="Brief description of the issue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-vault-green/50"
                  placeholder="Provide as much detail as possible..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => createTicket.mutate()}
                disabled={createTicket.isPending || !subject || !description}
                className="px-4 py-2 bg-vault-green text-black font-bold rounded-xl disabled:opacity-50"
              >
                {createTicket.isPending ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

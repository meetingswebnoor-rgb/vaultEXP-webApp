'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LifeBuoy, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminHelpdesk() {
  const [statusFilter, setStatusFilter] = useState('');

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['adminTickets'],
    queryFn: async () => {
      const res = await api.get('/admin/support');
      return res.data.data;
    },
    refetchInterval: 15000 // Poll for new tickets every 15s
  });

  const filteredTickets = tickets?.filter((t: any) => statusFilter ? t.status === statusFilter : true);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full pb-32">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <LifeBuoy className="text-vault-green" /> Support Helpdesk
          </h1>
          <p className="text-gray-400 mt-2">Manage customer issues, escalate tickets, and leverage AI Copilot for faster resolution.</p>
        </div>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2 text-white focus:outline-none appearance-none cursor-pointer"
        >
          <option value="">All Tickets</option>
          <option value="open">Open / Waiting</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.02] border-b border-white/[0.05]">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-400">ID / User</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Subject</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Priority</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Last Updated</th>
                <th className="px-6 py-4 font-semibold text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading global tickets...</td>
                </tr>
              ) : filteredTickets?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No tickets found in the queue.</td>
                </tr>
              ) : (
                filteredTickets?.map((ticket: any) => (
                  <tr key={ticket.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-white font-semibold">{ticket.user?.name || 'Unknown'}</div>
                      <div className="text-gray-500 text-xs font-mono">{ticket.id.substring(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium line-clamp-1 max-w-xs">{ticket.subject}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{ticket.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${
                        ticket.priority === 'urgent' || ticket.priority === 'high' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {ticket.priority === 'urgent' && <AlertCircle size={12} />}
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ticket.status === 'open' ? 'bg-yellow-500/10 text-yellow-500' :
                        ticket.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-vault-green/10 text-vault-green'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/tickets/${ticket.id}`} 
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold transition-colors inline-block"
                      >
                        Open Workspace
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

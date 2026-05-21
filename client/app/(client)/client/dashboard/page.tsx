'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { FileText, CreditCard, CheckSquare, Sparkles, Send, Download } from 'lucide-react';

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
    return <div className="p-8 text-gray-500">Loading your secure portal...</div>;
  }

  const data = dashboardData || { outstandingInvoicesCount: 0, totalOutstandingAmount: 0, pendingApprovals: 0, recentDocuments: [] };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><CreditCard size={20} /></div>
            <span className="text-sm font-bold text-red-600">{data.outstandingInvoicesCount} Due</span>
          </div>
          <p className="text-gray-500 text-sm mb-1">Outstanding Balance</p>
          <p className="text-3xl font-bold text-gray-900">${data.totalOutstandingAmount.toLocaleString()}</p>
          <button className="mt-4 w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
            Pay Now
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><CheckSquare size={20} /></div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Pending Approvals</p>
          <p className="text-3xl font-bold text-gray-900">{data.pendingApprovals}</p>
          <button className="mt-4 w-full py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">
            Review Items
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Documents Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="text-gray-400" size={20} /> Recent Shared Documents
            </h3>
          </div>
          <div className="flex-1 p-0">
            {data.recentDocuments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No documents shared yet.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {data.recentDocuments.map((doc: any) => (
                  <li key={doc.id} className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-500 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{new Date(doc.date).toLocaleDateString()} • {doc.type}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-blue-600 transition-colors p-2">
                      <Download size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Vault AI Client Assistant */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-[500px]">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ask Vault AI</h3>
              <p className="text-xs text-gray-500">Query your contracts and invoices securely.</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
            {chatHistory.length === 0 && (
              <div className="text-center text-gray-400 text-sm mt-10">
                I&apos;m your secure AI assistant. Ask me to summarize your recent contract or locate an invoice.
              </div>
            )}
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {aiMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="p-4 border-t border-gray-100 bg-white">
            <div className="relative">
              <input 
                type="text" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask about your documents..." 
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
              />
              <button 
                type="submit"
                disabled={!chatMessage.trim() || aiMutation.isPending}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

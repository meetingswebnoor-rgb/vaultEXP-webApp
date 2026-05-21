'use client';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Send } from 'lucide-react';

export default function PortalMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    api.get('/portal/messages')
       .then(res => setMessages(res.data.data.messages))
       .catch(() => setMessages([]));
  }, []);

  const send = async () => {
    if (!content.trim()) return;
    // Note: in a real app we dynamically pass receiverId from the portal host association
    setContent('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <h2 className="text-2xl font-bold mb-6">Secure Messages</h2>
      
      <div className="flex-1 bg-vault-card border border-white/5 rounded-2xl p-6 overflow-y-auto mb-4 flex flex-col">
        {messages.length === 0 ? (
          <div className="m-auto text-center">
            <p className="text-gray-500 mb-2">No messages yet.</p>
            <p className="text-sm text-gray-600">Start a secure conversation with your host.</p>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className="mb-4">
              <p className="text-xs text-gray-500 mb-1 ml-1">{m.sender?.name || 'Unknown'}</p>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl inline-block max-w-[80%] text-sm text-gray-200">
                {m.content}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-4">
        <input 
          type="text" 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a secure message..."
          className="flex-1 bg-vault-card border border-white/10 focus:border-vault-green/50 focus:outline-none rounded-xl px-5 text-sm"
        />
        <button 
          onClick={send} 
          className="px-6 py-3 bg-vault-green text-black font-bold rounded-xl flex items-center gap-2 hover:bg-vault-green/90 transition-all"
        >
          <Send size={16} /> Send
        </button>
      </div>
    </div>
  );
}

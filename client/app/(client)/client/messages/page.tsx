'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Paperclip, CalendarPlus, User, Building, MoreVertical, FileText } from 'lucide-react';
import { api } from '@/lib/api';

interface ChatChannel {
  id: string;
  name: string;
  type: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  attachmentUrl?: string;
}

export default function ClientMessagesPage() {
  const [activeChannelId, setActiveChannelId] = useState('c1');
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const channels: ChatChannel[] = [
    { id: 'c1', name: 'John Doe (Account Manager)', type: 'direct', lastMessage: 'Let me know when you review the drafts.', time: '10:45 AM', unreadCount: 2 },
    { id: 'c2', name: 'Billing Support', type: 'team', lastMessage: 'Your Q1 invoice has been updated.', time: 'Yesterday', unreadCount: 0 },
    { id: 'c3', name: 'Legal Team', type: 'team', lastMessage: 'The NDA is ready for signature.', time: 'Mon', unreadCount: 0 },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'm1', senderId: 'host', content: 'Hi! I uploaded the new contract drafts to your secure vault.', timestamp: '10:30 AM' },
    { id: 'm2', senderId: 'host', content: 'Please review them when you have a chance.', timestamp: '10:31 AM' },
    { id: 'm3', senderId: 'me', content: 'Thanks John, I will look at them this afternoon.', timestamp: '10:35 AM' },
    { id: 'm4', senderId: 'host', content: 'Perfect. Let me know when you review the drafts.', timestamp: '10:45 AM' },
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), senderId: 'me', content: input, timestamp: 'Just now' }]);
    setInput('');
  };

  const handleScheduleMeeting = () => {
    // In a real app: open a modal to select date/time, then POST to /api/client/meetings
    alert('Meeting Request triggered! In production, this opens a Calendar scheduler.');
  };

  const activeChannel = channels.find(c => c.id === activeChannelId);

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full h-[calc(100vh-80px)] flex flex-col pb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <MessageSquare className="text-[var(--brand-primary,#2563EB)]" /> Messages & Support
        </h1>
        <p className="text-gray-500 mt-2">Securely communicate with your account managers and support teams.</p>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex min-h-[500px]">
        {/* Left Pane: Channels */}
        <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50/50 flex-shrink-0 hidden md:flex">
          <div className="p-4 border-b border-gray-200 bg-white">
            <input 
              type="text"
              placeholder="Search messages..."
              className="w-full bg-gray-100 border-none outline-none px-4 py-2 text-sm text-gray-900 rounded-xl placeholder:text-gray-400"
            />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {channels.map(channel => (
              <div 
                key={channel.id}
                onClick={() => setActiveChannelId(channel.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors flex items-start gap-3 ${
                  activeChannelId === channel.id ? 'bg-blue-50/50 relative' : 'hover:bg-white'
                }`}
              >
                {activeChannelId === channel.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--brand-primary,#2563EB)]" />
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  channel.type === 'direct' ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  {channel.type === 'direct' ? <User size={20} /> : <Building size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-900 text-sm truncate pr-2">{channel.name}</h4>
                    <span className="text-[10px] font-bold text-gray-400 flex-shrink-0">{channel.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{channel.lastMessage}</p>
                </div>
                {channel.unreadCount > 0 && (
                  <div className="w-5 h-5 rounded-full bg-[var(--brand-primary,#2563EB)] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {channel.unreadCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Active Chat */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
          {/* Chat Header */}
          <div className="h-20 border-b border-gray-200 px-6 flex justify-between items-center bg-white z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">{activeChannel?.name}</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs font-bold text-gray-500">Online</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleScheduleMeeting}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 transition-colors"
              >
                <CalendarPlus size={16} className="text-[var(--brand-primary,#2563EB)]" /> 
                <span className="hidden sm:inline">Request Meeting</span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Chat History */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/30">
            {messages.map((msg, i) => {
              const isMe = msg.senderId === 'me';
              const showAvatar = !isMe && (i === 0 || messages[i-1].senderId !== msg.senderId);

              return (
                <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar Placeholder */}
                  <div className="w-8 flex-shrink-0 flex justify-center">
                    {showAvatar && (
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <User size={16} />
                      </div>
                    )}
                  </div>

                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    <div className={`px-5 py-3 text-sm leading-relaxed shadow-sm ${
                      isMe 
                        ? 'bg-[var(--brand-primary,#2563EB)] text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm'
                    }`}>
                      {msg.content}
                      {msg.attachmentUrl && (
                        <div className={`mt-3 p-3 rounded-xl flex items-center gap-3 ${isMe ? 'bg-white/20' : 'bg-gray-50 border border-gray-100'}`}>
                          <FileText size={20} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">Attached_Document.pdf</p>
                            <p className="text-[10px] opacity-80">1.2 MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 mt-1 mx-1">{msg.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-end gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-[var(--brand-primary,#2563EB)] focus-within:ring-2 focus-within:ring-blue-100 transition-all"
            >
              <button type="button" className="p-3 text-gray-400 hover:text-gray-900 transition-colors flex-shrink-0">
                <Paperclip size={20} />
              </button>
              <textarea 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Write a secure message..."
                className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-gray-900 placeholder:text-gray-400 resize-none max-h-32 min-h-[44px] custom-scrollbar"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="w-12 h-12 flex items-center justify-center rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex-shrink-0"
                style={{ backgroundColor: 'var(--brand-primary, #2563EB)' }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

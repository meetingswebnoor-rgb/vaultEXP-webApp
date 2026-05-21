'use client';
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { getSocket } from '@/lib/socket';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { MessageSquare, Users, FileText, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function ChatPage() {
  const { user } = useAuthStore();
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  let typingTimeout: any = null;

  useEffect(() => {
    // Fetch channels
    api.get('/chat/channels').then(res => {
      setChannels(res.data.data.channels);
      if (res.data.data.channels.length > 0) {
        setActiveChannel(res.data.data.channels[0]);
      }
    });

    const socket = getSocket();
    if (socket) {
      socketRef.current = socket;
      socket.on('new-message', (msg: any) => {
        setMessages(prev => [...prev, msg]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      });
      socket.on('user-typing', ({ userId, channelId }: any) => {
        setIsTyping(prev => ({ ...prev, [userId]: true }));
      });
      socket.on('user-stop-typing', ({ userId, channelId }: any) => {
        setIsTyping(prev => ({ ...prev, [userId]: false }));
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('new-message');
        socketRef.current.off('user-typing');
        socketRef.current.off('user-stop-typing');
      }
    };
  }, []);

  useEffect(() => {
    if (activeChannel && socketRef.current) {
      socketRef.current.emit('join-channel', activeChannel.channelId);
      socketRef.current.emit('mark-read', activeChannel.channelId);
      
      // Load history
      api.get(`/chat/channels/${activeChannel.channelId}/messages`)
         .then(res => {
           setMessages(res.data.data.messages);
           setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
         });
    }
  }, [activeChannel]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    if (!socketRef.current || !activeChannel) return;
    
    socketRef.current.emit('typing', { channelId: activeChannel.channelId });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socketRef.current.emit('stop-typing', { channelId: activeChannel.channelId });
    }, 2000);
  };

  const sendMessage = () => {
    if (!content.trim() || !activeChannel || !socketRef.current) return;
    socketRef.current.emit('send-message', { channelId: activeChannel.channelId, content });
    socketRef.current.emit('stop-typing', { channelId: activeChannel.channelId });
    setContent('');
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-vault-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative z-10">
      {/* Sidebar */}
      <div className="w-80 border-r border-white/5 bg-vault-darker/50 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare size={18} className="text-vault-green" /> Communications
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {channels.map(ch => (
            <button
              key={ch.channelId}
              onClick={() => setActiveChannel(ch)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                activeChannel?.channelId === ch.channelId 
                  ? "bg-vault-green/10 border border-vault-green/20" 
                  : "hover:bg-white/5 border border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  {ch.type === 'team' ? <Users size={16} /> : ch.type === 'document' ? <FileText size={16} /> : <UserAvatar name={ch.name} />}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-white truncate">{ch.name}</h4>
                  <p className="text-xs text-gray-500 truncate">{ch.lastMessage?.content || 'No messages yet'}</p>
                </div>
              </div>
              {ch.unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-vault-green text-black text-[10px] font-bold flex items-center justify-center shrink-0">
                  {ch.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-gradient-to-br from-vault-card to-vault-darker">
        {activeChannel ? (
          <>
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-vault-card/50 backdrop-blur-md">
              <h3 className="font-bold text-white">{activeChannel.name}</h3>
              <span className="px-2.5 py-1 bg-white/5 rounded-full text-xs text-gray-400 capitalize">{activeChannel.type}</span>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id || idx} className={cn("flex gap-3 max-w-[80%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                    <div className="w-8 h-8 rounded-full bg-vault-green/20 border border-vault-green/40 flex items-center justify-center text-xs font-bold text-vault-green shrink-0">
                      {msg.sender?.name?.[0] || 'A'}
                    </div>
                    <div>
                      <div className={cn("p-3 rounded-2xl text-sm", isMe ? "bg-vault-green text-black rounded-tr-sm" : "bg-white/5 text-gray-200 border border-white/10 rounded-tl-sm")}>
                        {msg.content}
                      </div>
                      <span className={cn("text-[10px] text-gray-500 mt-1 block", isMe ? "text-right" : "")}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing Indicators */}
              {Object.keys(isTyping).map(uid => isTyping[uid] && uid !== user?.id && (
                <div key={uid} className="flex gap-2 items-center text-xs text-gray-500">
                  <Loader2 size={12} className="animate-spin" /> someone is typing...
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/5 bg-vault-card/50">
              <form 
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 pr-3 focus-within:border-vault-green/50 transition-all"
              >
                <input 
                  type="text"
                  value={content}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white px-3"
                />
                <button 
                  type="submit"
                  disabled={!content.trim()}
                  className="w-8 h-8 rounded-xl bg-vault-green flex items-center justify-center text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-vault-green/90 transition-all"
                >
                  <Send size={14} className="-ml-0.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="m-auto text-center">
            <MessageSquare size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 font-bold">Select a channel to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

function UserAvatar({ name }: { name: string }) {
  return (
    <div className="w-full h-full text-xs font-bold flex items-center justify-center text-gray-400">
      {name?.[0] || 'U'}
    </div>
  );
}

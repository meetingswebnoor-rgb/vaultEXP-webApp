'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageApi, Message, Attachment } from '../api/messageApi';
import { walletApi } from '@/features/wallet/api/walletApi';
import { 
  Send, 
  Paperclip, 
  MoreVertical, 
  Search, 
  MessageSquare, 
  Hash, 
  User, 
  Building2, 
  ChevronLeft,
  Clock,
  CheckCheck,
  BrainCircuit,
  Image as ImageIcon,
  FileText,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils/cn';

export function MessagingSystem() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showBusinessList, setShowBusinessList] = useState(true);

  // Queries
  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses'],
    queryFn: walletApi.getBusinesses
  });

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', selectedBusinessId, activeThreadId],
    queryFn: () => selectedBusinessId ? messageApi.getMessages(selectedBusinessId, activeThreadId || undefined) : Promise.resolve([]),
    enabled: !!selectedBusinessId
  });

  const { data: threads = [] } = useQuery({
    queryKey: ['threads', selectedBusinessId],
    queryFn: () => selectedBusinessId ? messageApi.getThreads(selectedBusinessId) : Promise.resolve([]),
    enabled: !!selectedBusinessId && !activeThreadId
  });

  // Mutations
  const sendMutation = useMutation({
    mutationFn: messageApi.sendMessage,
    onSuccess: (newMessage) => {
      queryClient.setQueryData(['messages', selectedBusinessId, activeThreadId], (old: Message[] = []) => [...old, newMessage]);
      setMessageInput('');
      scrollToBottom();
    }
  });

  // Effects
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedBusinessId) return;

    sendMutation.mutate({
      businessId: selectedBusinessId,
      content: messageInput,
      parentId: activeThreadId || undefined
    });
  };

  const selectedBusiness = businesses.find((b: any) => b._id === selectedBusinessId);

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[600px] bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
      {/* Business Sidebar */}
      <AnimatePresence mode="wait">
        {(showBusinessList || !isMobileView) && (
          <motion.div 
            initial={isMobileView ? { x: -300 } : false}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={cn(
              "w-full lg:w-80 border-r border-white/10 flex flex-col bg-black/20",
              isMobileView && !showBusinessList && "hidden"
            )}
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <MessageSquare className="text-vault-green" />
                Messages
              </h2>
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="text" 
                  placeholder="Search businesses..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none focus:border-vault-green"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {businesses.map((business: any) => (
                <button
                  key={business._id}
                  onClick={() => {
                    setSelectedBusinessId(business._id);
                    setActiveThreadId(null);
                    if (isMobileView) setShowBusinessList(false);
                  }}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 group",
                    selectedBusinessId === business._id 
                      ? "bg-vault-green text-black" 
                      : "text-white/60 hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                    selectedBusinessId === business._id ? "bg-black/20" : "bg-white/5"
                  )}>
                    <Building2 size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className={cn(
                      "font-semibold truncate",
                      selectedBusinessId === business._id ? "text-black" : "text-white"
                    )}>
                      {business.name}
                    </p>
                    <p className="text-xs opacity-60 truncate">
                      {business.type} • Active now
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {!selectedBusinessId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
            <MessageSquare size={64} className="mb-6" />
            <h3 className="text-2xl font-display font-bold text-white">Select a business chat</h3>
            <p className="text-sm max-w-xs mt-2">Choose a business from the sidebar to start collaborating.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 lg:p-6 border-b border-white/10 flex items-center justify-between bg-black/10 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                {isMobileView && (
                  <button onClick={() => setShowBusinessList(true)} className="p-2 hover:bg-white/5 rounded-lg text-white">
                    <ChevronLeft />
                  </button>
                )}
                <div className="w-10 h-10 bg-vault-green/20 rounded-xl flex items-center justify-center text-vault-green">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white leading-none">{selectedBusiness?.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-vault-green animate-pulse" />
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Business Vault Channel</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                  <Hash size={20} />
                </button>
                <button className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages Display */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            >
              {isLoadingMessages ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-vault-green animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-20">
                  <div className="p-6 border-2 border-dashed border-white/20 rounded-full mb-4">
                    <Paperclip size={32} />
                  </div>
                  <p>Start the conversation with an attachment or advice.</p>
                </div>
              ) : (
                messages.map((msg: Message, idx: number) => {
                  const isMe = true; // In a real app, compare with user state
                  return (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-4 max-w-[85%]",
                        isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {msg.type === 'ai_advice' ? <BrainCircuit size={20} className="text-vault-green" /> : <User size={20} className="text-white/40" />}
                      </div>
                      <div className="space-y-2 min-w-0">
                        <div className={cn(
                          "p-4 rounded-2xl border backdrop-blur-sm shadow-lg",
                          isMe 
                            ? "bg-vault-green/10 border-vault-green/20 rounded-tr-none text-white" 
                            : "bg-white/5 border-white/10 rounded-tl-none text-white/80"
                        )}>
                          {msg.type === 'ai_advice' && (
                            <div className="flex items-center gap-2 mb-2 text-vault-green text-[10px] font-bold uppercase tracking-widest">
                              <BrainCircuit size={12} />
                              AI Generated Insights
                            </div>
                          )}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          
                          {msg.attachments?.map((att, i) => (
                            <div key={i} className="mt-3 p-3 bg-black/30 rounded-xl border border-white/10 flex items-center gap-3 hover:bg-black/50 transition-all cursor-pointer group">
                              <div className="p-2 bg-vault-green/10 rounded-lg text-vault-green">
                                {att.fileType.includes('image') ? <ImageIcon size={16} /> : <FileText size={16} />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium truncate">{att.name}</p>
                                <p className="text-[10px] text-white/40 uppercase">{att.fileType}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className={cn(
                          "flex items-center gap-2 text-[10px] text-white/40",
                          isMe ? "flex-row-reverse" : "flex-row"
                        )}>
                          <span className="font-bold uppercase tracking-wider">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <CheckCheck size={14} className="text-vault-green" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 lg:p-6 bg-black/20 border-t border-white/10">
              <form onSubmit={handleSendMessage} className="relative flex items-end gap-2 lg:gap-4 max-w-5xl mx-auto">
                <button 
                  type="button" 
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all shrink-0"
                >
                  <Paperclip size={20} />
                </button>
                
                <div className="flex-1 relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Message ${selectedBusiness?.name}...`}
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3.5 pr-12 text-sm text-white outline-none focus:border-vault-green resize-none max-h-32 transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!messageInput.trim() || sendMutation.isPending}
                    className="absolute right-2 bottom-2 p-2 bg-vault-green text-black rounded-xl hover:brightness-110 disabled:opacity-30 disabled:grayscale transition-all"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Threads Sidebar (Optional, but user asked for it) */}
      {!isMobileView && selectedBusinessId && (
        <div className="w-80 border-l border-white/10 bg-black/30 hidden xl:flex flex-col">
          <div className="p-6 border-b border-white/10">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-vault-green" />
              Thread History
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {threads.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/20 text-sm italic p-6 text-center">
                No active threads for this business.
              </div>
            ) : (
              threads.map(thread => (
                <div key={thread._id} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-vault-green/30 transition-all cursor-pointer group">
                  <p className="text-xs text-white/80 line-clamp-2">{thread.content}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-white/40 uppercase font-bold">{new Date(thread.createdAt).toLocaleDateString()}</span>
                    <span className="text-[10px] bg-vault-green/10 text-vault-green px-2 py-0.5 rounded-full">3 replies</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { create } from 'zustand';

interface LiveState {
  liveTasks: Record<string, any>;
  liveCrm: Record<string, any>;
  liveChats: Record<string, any[]>;
  liveDocuments: Record<string, any>;
  lastEventAt: number | null;
  
  // Actions
  addLiveChat: (channelId: string, message: any) => void;
  updateLiveTask: (taskId: string, payload: any) => void;
  updateLiveCrm: (entityId: string, payload: any) => void;
  updateLiveDocument: (docId: string, payload: any) => void;
  clearLiveState: () => void;
}

export const useLiveStore = create<LiveState>((set) => ({
  liveTasks: {},
  liveCrm: {},
  liveChats: {},
  liveDocuments: {},
  lastEventAt: null,

  addLiveChat: (channelId, message) => set((state) => {
    const existingChats = state.liveChats[channelId] || [];
    // Prevent duplicate messages if already rendered optimistically
    if (existingChats.some(chat => chat.id === message.id)) return state;
    return {
      liveChats: { ...state.liveChats, [channelId]: [...existingChats, message] },
      lastEventAt: Date.now()
    };
  }),

  updateLiveTask: (taskId, payload) => set((state) => ({
    liveTasks: { ...state.liveTasks, [taskId]: { ...state.liveTasks[taskId], ...payload } },
    lastEventAt: Date.now()
  })),

  updateLiveCrm: (entityId, payload) => set((state) => ({
    liveCrm: { ...state.liveCrm, [entityId]: { ...state.liveCrm[entityId], ...payload } },
    lastEventAt: Date.now()
  })),

  updateLiveDocument: (docId, payload) => set((state) => ({
    liveDocuments: { ...state.liveDocuments, [docId]: { ...state.liveDocuments[docId], ...payload } },
    lastEventAt: Date.now()
  })),

  clearLiveState: () => set({
    liveTasks: {},
    liveCrm: {},
    liveChats: {},
    liveDocuments: {},
    lastEventAt: null
  })
}));

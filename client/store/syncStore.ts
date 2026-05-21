import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from '@/lib/secureStorage';

export type SyncTaskType = 'upload' | 'ai_sync' | 'automation_sync' | 'notification_sync' | 'crm_update';

export interface SyncTask {
  id: string;
  type: SyncTaskType;
  payload: any;
  status: 'pending' | 'failed';
  retryCount: number;
  createdAt: number;
}

interface SyncState {
  queue: SyncTask[];
  isSyncing: boolean;
  enqueue: (type: SyncTaskType, payload: any) => void;
  dequeue: (id: string) => void;
  markFailed: (id: string) => void;
  setSyncing: (syncing: boolean) => void;
  clearQueue: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      queue: [],
      isSyncing: false,
      enqueue: (type, payload) => set((state) => ({
        queue: [...state.queue, {
          id: Math.random().toString(36).substring(7) + Date.now().toString(36),
          type,
          payload,
          status: 'pending',
          retryCount: 0,
          createdAt: Date.now()
        }]
      })),
      dequeue: (id) => set((state) => ({
        queue: state.queue.filter(task => task.id !== id)
      })),
      markFailed: (id) => set((state) => ({
        queue: state.queue.map(task => 
          task.id === id 
            ? { ...task, status: 'failed', retryCount: task.retryCount + 1 } 
            : task
        )
      })),
      setSyncing: (isSyncing) => set({ isSyncing }),
      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: 'vault-sync-queue',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);

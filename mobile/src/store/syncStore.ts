import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';

export type MutationType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface OfflineMutation {
  id: string;
  table: string;
  type: MutationType;
  payload: any;
  timestamp: number;
}

interface SyncState {
  lastSyncTimestamp: number | null;
  mutationQueue: OfflineMutation[];
  isSyncing: boolean;
  
  queueCreate: (table: string, payload: any) => void;
  queueUpdate: (table: string, id: string, payload: any) => void;
  queueDelete: (table: string, id: string) => void;
  triggerSync: () => Promise<void>;
  setLastSync: (timestamp: number) => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      lastSyncTimestamp: null,
      mutationQueue: [],
      isSyncing: false,

      queueCreate: (table, payload) => {
        const mutation: OfflineMutation = {
          id: payload.id || Math.random().toString(36).substr(2, 9),
          table,
          type: 'CREATE',
          payload,
          timestamp: Date.now()
        };
        set((state) => ({ mutationQueue: [...state.mutationQueue, mutation] }));
        get().triggerSync();
      },

      queueUpdate: (table, id, payload) => {
        const mutation: OfflineMutation = {
          id,
          table,
          type: 'UPDATE',
          payload,
          timestamp: Date.now()
        };
        set((state) => ({ mutationQueue: [...state.mutationQueue, mutation] }));
        get().triggerSync();
      },

      queueDelete: (table, id) => {
        const mutation: OfflineMutation = {
          id,
          table,
          type: 'DELETE',
          payload: { id },
          timestamp: Date.now()
        };
        set((state) => ({ mutationQueue: [...state.mutationQueue, mutation] }));
        get().triggerSync();
      },

      triggerSync: async () => {
        const { isSyncing, mutationQueue, lastSyncTimestamp } = get();
        if (isSyncing) return;

        set({ isSyncing: true });

        try {
          // 1. Format Queue into Push Payload
          if (mutationQueue.length > 0) {
            const changes: Record<string, { created: any[], updated: any[], deleted: string[] }> = {};
            
            mutationQueue.forEach(m => {
              if (!changes[m.table]) {
                changes[m.table] = { created: [], updated: [], deleted: [] };
              }
              if (m.type === 'CREATE') changes[m.table].created.push(m.payload);
              if (m.type === 'UPDATE') changes[m.table].updated.push(m.payload);
              if (m.type === 'DELETE') changes[m.table].deleted.push(m.id);
            });

            const pushRes = await apiClient.post('/sync/push', { changes });
            
            // If the server responded successfully, clear the queue.
            // In a production app, we would process pushRes.data.results.conflicts here
            // to overwrite our local SQLite data with the server's truth.
            if (pushRes.data.success) {
              set({ mutationQueue: [] }); 
            }
          }

          // 2. Pull Remote Changes
          const pullRes = await apiClient.get('/sync/pull', { 
            params: { lastPulledAt: lastSyncTimestamp } 
          });

          // Update local timestamp
          set({ lastSyncTimestamp: pullRes.data.timestamp });
          
        } catch (error) {
          console.error('[SyncStore] Synchronization failed, retaining queue:', error);
          // Queue remains untouched so we can automatically retry next time triggerSync runs
        } finally {
          set({ isSyncing: false });
        }
      },

      setLastSync: (timestamp) => set({ lastSyncTimestamp: timestamp })
    }),
    {
      name: 'vault-sync-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

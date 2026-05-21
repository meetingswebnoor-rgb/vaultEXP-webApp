'use client';

import { useEffect, useRef } from 'react';
import { useSyncStore, SyncTask } from '@/store/syncStore';
import { api } from '@/lib/api';

// Polyfill type for TS
interface IdleDeadline {
  timeRemaining: () => number;
  didTimeout: boolean;
}

/**
 * Headless component that leverages `requestIdleCallback` to process
 * offline mutations and sync tasks WITHOUT stealing CPU cycles from React renders.
 */
export function BackgroundSyncWorker() {
  const activeTaskRef = useRef<boolean>(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const processNext = async (deadline: IdleDeadline) => {
      // 1. Bail if offline
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        scheduleNext();
        return;
      }
      
      const state = useSyncStore.getState();
      const pendingTasks = state.queue.filter(t => t.status === 'pending');
      
      if (pendingTasks.length === 0) {
        if (state.isSyncing) state.setSyncing(false);
        scheduleNext();
        return;
      }

      // Avoid concurrent task execution
      if (activeTaskRef.current) {
        scheduleNext();
        return;
      }

      // 2. We have time and tasks. Grab the oldest one.
      // Need at least 5ms of idle frame time to begin work safely
      if (deadline.timeRemaining() > 5 || deadline.didTimeout) { 
        const task = pendingTasks[0];
        activeTaskRef.current = true;
        state.setSyncing(true);

        try {
          await executeTask(task);
          // On success, completely remove from queue
          useSyncStore.getState().dequeue(task.id);
        } catch (err) {
          console.error(`[BACKGROUND SYNC] Task Failed: ${task.type}`, err);
          // Mark as failed so we don't infinitely retry in this loop
          // (a separate mechanism or manual user action would reset failed tasks)
          useSyncStore.getState().markFailed(task.id);
        } finally {
          activeTaskRef.current = false;
          scheduleNext();
        }
      } else {
        // Not enough idle time right now, defer to next tick.
        scheduleNext();
      }
    };

    const scheduleNext = () => {
      const pendingCount = useSyncStore.getState().queue.filter(t => t.status === 'pending').length;
      // If we have tasks, poll aggressively (every 2s). If idle, poll every 10s.
      const delay = pendingCount > 0 ? 2000 : 10000; 
      
      timeoutId = setTimeout(() => {
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          (window as any).requestIdleCallback(processNext, { timeout: 2000 });
        } else {
          // Fallback for Safari/browsers without requestIdleCallback
          setTimeout(() => processNext({ timeRemaining: () => 50, didTimeout: false }), 0);
        }
      }, delay);
    };

    // Kick off the loop
    scheduleNext();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return null; // Headless
}

async function executeTask(task: SyncTask) {
  // Demo dispatch mapping for different background operations
  switch (task.type) {
    case 'upload':
      return api.post('/documents/upload', task.payload);
    case 'ai_sync':
      return api.post('/ai/sync', task.payload);
    case 'automation_sync':
      return api.post('/automations/sync', task.payload);
    case 'crm_update':
      return api.put(`/crm/${task.payload.id}`, task.payload);
    case 'notification_sync':
      return api.post('/notifications/sync', task.payload);
    default:
      console.warn(`[BACKGROUND SYNC] Unknown task type: ${task.type}`);
      return Promise.resolve();
  }
}

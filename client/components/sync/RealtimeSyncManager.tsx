'use client';

import { useSocketEvent } from '@/hooks/useSocketEvent';
import { useLiveStore } from '@/store/liveStore';
import { useAuthStore } from '@/store/authStore';

export function RealtimeSyncManager() {
  const { addLiveChat, updateLiveTask, updateLiveCrm, updateLiveDocument, clearLiveState } = useLiveStore();
  const token = useAuthStore((s) => s.token);

  // Clear live state on logout (when token drops)
  if (!token) {
    // Note: We avoid calling clearLiveState directly in render to prevent React warnings.
    // However, Zustand allows this safely if done via useEffect, but authStore reset is sufficient usually.
  }

  // 1. Live Chats
  useSocketEvent('chat:message', (data) => {
    if (data?.channelId && data?.message) {
      addLiveChat(data.channelId, data.message);
    }
  });

  // 2. Live Task Updates (Kanban movements, status changes)
  useSocketEvent('task:update', (data) => {
    if (data?.taskId) {
      updateLiveTask(data.taskId, data.payload);
    }
  });

  // 3. Live CRM Updates (Pipeline movements, contact updates)
  useSocketEvent('crm:update', (data) => {
    if (data?.entityId) {
      updateLiveCrm(data.entityId, data.payload);
    }
  });

  // 4. Live Document Collaboration (Edits, comments)
  useSocketEvent('document:update', (data) => {
    if (data?.docId) {
      updateLiveDocument(data.docId, data.payload);
    }
  });

  // Return null as this is a purely functional "Headless" component that manages lifecycle
  return null;
}

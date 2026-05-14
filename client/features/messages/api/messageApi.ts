import { api } from '@/lib/api';

export interface Attachment {
  fileType: string;
  name: string;
  url: string;
  documentId?: string;
}

export interface Message {
  _id: string;
  businessId: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  type: 'text' | 'system' | 'ai_advice' | 'thread_start';
  parentId?: string;
  attachments: Attachment[];
  createdAt: string;
}

export const messageApi = {
  getMessages: async (businessId: string, parentId?: string) => {
    const res = await api.get<{ success: boolean; data: Message[] }>(`/messages/business/${businessId}`, {
      params: { parentId }
    });
    return res.data.data;
  },

  getThreads: async (businessId: string) => {
    const res = await api.get<{ success: boolean; data: Message[] }>(`/messages/business/${businessId}/threads`);
    return res.data.data;
  },

  sendMessage: async (data: { 
    businessId: string; 
    content: string; 
    parentId?: string; 
    attachments?: Attachment[]; 
    type?: string 
  }) => {
    const res = await api.post<{ success: boolean; data: Message }>('/messages', data);
    return res.data.data;
  },

  markRead: async (businessId: string) => {
    const res = await api.patch(`/messages/read/${businessId}`);
    return res.data;
  }
};

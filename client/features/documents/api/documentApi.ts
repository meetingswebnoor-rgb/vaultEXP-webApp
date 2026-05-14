import { api } from '@/lib/api';

export interface Document {
  _id: string;
  name: string;
  url: string;
  type: string;
  category: string;
  size: number;
  tags: string[];
  aiSummary?: string;
  isPrivate: boolean;
  createdAt: string;
}

export const documentApi = {
  getDocuments: async (params?: { category?: string; search?: string }) => {
    const res = await api.get<{ success: boolean; data: { count: number; documents: Document[] } }>('/documents', { params });
    return res.data.data.documents;
  },

  uploadDocument: async (formData: FormData) => {
    const res = await api.post<{ success: boolean; data: Document }>('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  processAI: async (id: string) => {
    const res = await api.post<{ success: boolean; data: Document }>(`/documents/${id}/process`);
    return res.data.data;
  },

  deleteDocument: async (id: string) => {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  }
};

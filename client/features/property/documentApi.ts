import { api } from '@/lib/api';

export interface PropertyDocument {
  _id: string;
  propertyId: string;
  name: string;
  fileUrl: string;
  type: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedAt: string;
  expiresAt?: string;
  notes?: string;
  ai?: { summary?: string };
}

export type DocumentFormData = Omit<PropertyDocument, '_id' | 'propertyId' | 'uploadedAt' | 'ai'>;

export const documentApi = {
  list: async (propertyId: string): Promise<PropertyDocument[]> => {
    const res = await api.get(`/property/${propertyId}/documents`);
    return res.data.data?.documents ?? [];
  },

  create: async (propertyId: string, data: DocumentFormData): Promise<PropertyDocument> => {
    const res = await api.post(`/property/${propertyId}/documents`, data);
    return res.data.data;
  },

  update: async (documentId: string, data: Partial<DocumentFormData>): Promise<PropertyDocument> => {
    const res = await api.put(`/property/document/${documentId}`, data);
    return res.data.data;
  },

  delete: async (documentId: string): Promise<void> => {
    await api.delete(`/property/document/${documentId}`);
  },
};

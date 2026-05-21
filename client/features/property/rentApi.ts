import { api } from '@/lib/api';
import { Tenant } from './tenantApi';

export interface RentRecord {
  _id: string;
  propertyId: string;
  tenantId: Tenant | string; // populated or just ID
  month: string; // YYYY-MM
  amountExpected: number;
  amountPaid: number;
  paymentDate?: string;
  status: 'pending' | 'paid' | 'partial' | 'overdue';
  method?: string;
  notes?: string;
  ai?: {
    anomaly?: boolean;
    insights?: string[];
  };
}

export const rentApi = {
  list: async (propertyId: string, month: string): Promise<RentRecord[]> => {
    const res = await api.get(`/property/${propertyId}/rent`, { params: { month } });
    return res.data.data || [];
  },

  generateBulk: async (propertyId: string, month: string): Promise<RentRecord[]> => {
    const res = await api.post(`/property/${propertyId}/rent/generate`, { month });
    return res.data.data || [];
  },

  getOrCreate: async (propertyId: string, tenantId: string, month: string): Promise<RentRecord> => {
    const res = await api.post(`/property/${propertyId}/tenant/${tenantId}/rent`, { month });
    return res.data.data;
  },

  update: async (recordId: string, data: Partial<RentRecord>): Promise<RentRecord> => {
    const res = await api.put(`/property/rent/${recordId}`, data);
    return res.data.data;
  },
};

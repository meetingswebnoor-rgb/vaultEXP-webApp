import { api } from '@/lib/api';

export interface PropertyAnalytics {
  propertyId: string;
  propertyName: string;
  metrics: {
    totalRent: number;
    totalExpenses: number;
    netProfit: number;
  };
  chartData: {
    month: string;
    rent: number;
    expenses: number;
    profit: number;
  }[];
}

export const analyticsApi = {
  get: async (propertyId: string): Promise<PropertyAnalytics> => {
    const res = await api.get(`/property/${propertyId}/analytics`);
    return res.data.data;
  }
};

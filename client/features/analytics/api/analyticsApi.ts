import { api } from '@/lib/api';

export const analyticsApi = {
  getBusinessAnalytics: async (businessId: string) => {
    const response = await api.get(`/api/analytics/business/${businessId}`);
    return response.data.data;
  }
};

import { api } from '@/lib/api';

export interface Tenant {
  _id: string;
  propertyId: string;
  name: string;
  email?: string;
  phone?: string;
  rentAmount: number;
  securityDeposit?: number;
  leaseStartDate: string;
  leaseEndDate?: string;
  paymentDueDay?: number;
  status: 'active' | 'inactive' | 'vacated' | 'evicted';
  notes?: string;
  daysUntilLeaseExpiry?: number;
  isLeaseExpiringSoon?: boolean;
}

export interface TenantFormData {
  name: string;
  email?: string;
  phone?: string;
  rentAmount: number | string;
  securityDeposit?: number | string;
  leaseStartDate: string;
  leaseEndDate?: string;
  paymentDueDay?: number;
  status?: string;
  notes?: string;
}

export const tenantApi = {
  list: async (propertyId: string): Promise<Tenant[]> => {
    const res = await api.get(`/api/property/${propertyId}/tenants`);
    return res.data.data?.tenants ?? [];
  },

  create: async (propertyId: string, data: TenantFormData): Promise<Tenant> => {
    const res = await api.post(`/api/property/${propertyId}/tenants`, data);
    return res.data.data;
  },

  update: async (tenantId: string, data: Partial<TenantFormData>): Promise<Tenant> => {
    const res = await api.put(`/api/property/tenant/${tenantId}`, data);
    return res.data.data;
  },

  delete: async (tenantId: string): Promise<void> => {
    await api.delete(`/api/property/tenant/${tenantId}`);
  },
};

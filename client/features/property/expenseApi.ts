import { api } from '@/lib/api';

export interface PropertyExpense {
  _id: string;
  propertyId: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  vendor?: string;
  paymentMethod?: string;
}

export type ExpenseFormData = Omit<PropertyExpense, '_id' | 'propertyId'>;

export const expenseApi = {
  list: async (propertyId: string): Promise<PropertyExpense[]> => {
    const res = await api.get(`/api/property/${propertyId}/expenses`);
    return res.data.data?.expenses ?? [];
  },

  create: async (propertyId: string, data: ExpenseFormData): Promise<PropertyExpense> => {
    const res = await api.post(`/api/property/${propertyId}/expenses`, data);
    return res.data.data;
  },

  update: async (expenseId: string, data: Partial<ExpenseFormData>): Promise<PropertyExpense> => {
    const res = await api.put(`/api/property/expense/${expenseId}`, data);
    return res.data.data;
  },

  delete: async (expenseId: string): Promise<void> => {
    await api.delete(`/api/property/expense/${expenseId}`);
  },
};

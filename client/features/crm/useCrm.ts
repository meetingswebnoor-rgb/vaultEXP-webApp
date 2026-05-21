import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useContacts = () => {
  return useQuery({
    queryKey: ['crm', 'contacts'],
    queryFn: async () => {
      const { data } = await api.get('/api/crm/contacts');
      return data.data.contacts;
    },
  });
};

export const useDeals = () => {
  return useQuery({
    queryKey: ['crm', 'deals'],
    queryFn: async () => {
      const { data } = await api.get('/api/crm/deals');
      return data.data.deals;
    },
  });
};

export const usePipelines = () => {
  return useQuery({
    queryKey: ['crm', 'pipelines'],
    queryFn: async () => {
      const { data } = await api.get('/api/crm/pipelines');
      return data.data.pipelines;
    },
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/api/crm/contacts', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'contacts'] });
    },
  });
};

export const useCreateDeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/api/crm/deals', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'deals'] });
      queryClient.invalidateQueries({ queryKey: ['crm', 'pipelines'] });
    },
  });
};

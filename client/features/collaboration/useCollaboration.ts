import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useComments = (resourceType: string, resourceId: string) => {
  return useQuery({
    queryKey: ['comments', resourceType, resourceId],
    queryFn: async () => {
      const { data } = await api.get(`/collaboration/comments?resourceType=${resourceType}&resourceId=${resourceId}`);
      return data.data.comments;
    },
    enabled: !!resourceId && !!resourceType,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/collaboration/comments', payload);
      return data.data;
    },
    onSuccess: (_, variables) => {
      if (variables.businessId) queryClient.invalidateQueries({ queryKey: ['comments', 'business', variables.businessId] });
      if (variables.propertyId) queryClient.invalidateQueries({ queryKey: ['comments', 'property', variables.propertyId] });
      if (variables.documentId) queryClient.invalidateQueries({ queryKey: ['comments', 'document', variables.documentId] });
      if (variables.investmentId) queryClient.invalidateQueries({ queryKey: ['comments', 'investment', variables.investmentId] });
    },
  });
};

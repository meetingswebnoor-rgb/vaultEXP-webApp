import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useFeatureAccess(featureKey: 'hasCrmAccess' | 'hasAnalyticsAccess' | 'hasAdvancedTeam') {
  const { data, isLoading } = useQuery({
    queryKey: ['activeSubscription'],
    queryFn: async () => {
      // In a real implementation this would fetch the user's active subscription
      // For now, we mock it or fetch a specific endpoint if one exists
      const res = await api.get('/user/subscription').catch(() => null);
      return res?.data?.data || null;
    }
  });

  if (isLoading) return { hasAccess: false, isLoading: true };

  // If no active subscription, default to false (or true for free tier if designed that way)
  if (!data || !data.plan) return { hasAccess: false, isLoading: false };

  return {
    hasAccess: data.plan[featureKey] === true,
    isLoading: false,
    planName: data.plan.name
  };
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ['billing', 'currentSubscription'],
    queryFn: async () => {
      const res = await api.get('/billing/subscription').catch(() => null);
      return res?.data?.data || null;
    }
  });
}

export function usePlans() {
  return useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: async () => {
      const res = await api.get('/billing/plans').catch(() => null);
      return res?.data?.data || [];
    }
  });
}

export function useCustomerPortal() {
  const { data: subscription } = useCurrentSubscription();
  return {
    mutate: async () => {
      const res = await api.post('/billing/portal-session');
      if (res.data?.data?.url) window.location.href = res.data.data.url;
    },
    isPending: false,
  };
}

export function useCheckout() {
  return {
    mutate: async (planId: string) => {
      const res = await api.post('/billing/checkout-session', { planId });
      if (res.data?.data?.url) window.location.href = res.data.data.url;
    },
    isPending: false,
  };
}


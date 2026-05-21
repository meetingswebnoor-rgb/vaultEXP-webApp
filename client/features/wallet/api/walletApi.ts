import { api } from '@/lib/api';

/**
 * Wallet & Business API Service
 * Handles financial entities and business tracking.
 */
export const walletApi = {
  /**
   * Get all businesses for the current user.
   */
  getBusinesses: async () => {
    const response = await api.get('/api/business');
    const root = response.data;
    // Handle both wrapped { data: { businesses } } and legacy { businesses } or direct array
    const data = root.data || root;
    return data.businesses || (Array.isArray(data) ? data : []);
  },

  /**
   * Get all wallets for the current user.
   */
  getWallets: async () => {
    const response = await api.get('/api/wallet');
    const root = response.data;
    const data = root.data || root;
    return data.wallets || (Array.isArray(data) ? data : []);
  },

  /**
   * Get wallet analytics.
   */
  getWalletAnalytics: async () => {
    const response = await api.get('/api/wallet/analytics');
    return response.data.data;
  },

  /**
   * Create a new wallet.
   */
  createWallet: async (data: any) => {
    const response = await api.post('/api/wallet', data);
    return response.data.data;
  },

  /**
   * Add a transaction to a wallet.
   */
  addTransaction: async (walletId: string, data: any) => {
    const response = await api.post(`/api/wallet/${walletId}/transactions`, data);
    return response.data.data;
  },
};

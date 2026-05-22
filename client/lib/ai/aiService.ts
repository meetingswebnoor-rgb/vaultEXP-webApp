/**
 * aiService.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Centralized VaultEXP AI Client Service
 *
 * All AI API calls across the frontend should go through this service.
 * It handles:
 *  - Proper request formatting
 *  - Timeout protection (15s)
 *  - Error catching — never throws to the caller
 *  - Consistent response shape
 *  - Loading state management helpers
 * ─────────────────────────────────────────────────────────────────────────
 */

import { api } from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────────────────

export interface AIChatResponse {
  success: boolean;
  reply: string;
  actionsTaken?: any[];
  analytics?: string | null;
  source?: string;
  timestamp?: string;
  isFallback?: boolean;
}

export interface AIInsightsResponse {
  summary: string;
  anomalies: Array<{ type: string; description: string; severity: string }>;
  recommendations: Array<{ actionText: string; actionType: string; route: string }>;
}

export interface AIAction {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  ctaLabel: string;
  route: string;
}

export interface AINotification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
  read: boolean;
}

export interface AIStatus {
  gemini: boolean;
  openai: boolean;
  anthropic: boolean;
  active: string;
  fallbackAvailable: boolean;
  message: string;
}

// ── Fallback responses (client-side) ────────────────────────────────────────

const CLIENT_FALLBACK_REPLY =
  `Taliv is still making me smarter. I'll be able to answer advanced queries soon. ` +
  `I can currently help with simple VaultEXP, business, productivity, and document questions ` +
  `while Taliv continues improving my intelligence.`;

const CLIENT_FALLBACK_INSIGHTS: AIInsightsResponse = {
  summary: `VaultAI is ready to analyze your dashboard. Add business, property, and investment data to unlock personalized AI insights.`,
  anomalies: [],
  recommendations: [
    { actionText: 'Complete your business profile', actionType: 'View Details', route: '/business' },
    { actionText: 'Log expenses for spending analysis', actionType: 'View Details', route: '/expenses' },
    { actionText: 'Upload tax documents', actionType: 'View Details', route: '/documents' },
  ]
};

// ── AI Service Class ─────────────────────────────────────────────────────────

class AIService {

  /**
   * Send a chat message to VaultAI.
   * Never throws — returns a client-side fallback if the request fails.
   *
   * @param query       - The user's message
   * @param modules     - Active modules context (default: ['all'])
   * @param signal      - Optional AbortController signal for cancellation
   */
  async chat(
    query: string,
    modules: string[] = ['all'],
    signal?: AbortSignal
  ): Promise<AIChatResponse> {
    if (!query || !query.trim()) {
      return {
        success: true,
        reply: `Hello! I'm VaultAI. Ask me anything about your business, invoices, properties, investments, taxes, or VaultEXP features.`,
        isFallback: true
      };
    }

    try {
      const res = await api.post(
        '/ai/chat',
        { query: query.trim(), activeModules: modules },
        { signal, timeout: 20000 }
      );

      const data = res.data?.data;
      return {
        success: true,
        reply: data?.reply || CLIENT_FALLBACK_REPLY,
        actionsTaken: data?.actionsTaken || [],
        analytics: data?.analytics || null,
        source: data?.source,
        timestamp: data?.timestamp,
        isFallback: res.data?.fallback === true
      };

    } catch (err: any) {
      // AbortController cancellation — don't show error
      if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') {
        return { success: false, reply: '', isFallback: true };
      }

      console.error('[AIService] chat error:', err?.message);
      return {
        success: true,
        reply: CLIENT_FALLBACK_REPLY,
        actionsTaken: [],
        analytics: null,
        isFallback: true
      };
    }
  }

  /**
   * Fetch AI dashboard insights.
   * Never throws.
   */
  async getInsights(): Promise<AIInsightsResponse> {
    try {
      const res = await api.get('/ai/insights', { timeout: 15000 });
      const data = res.data?.data;

      if (data?.summary) return data;
      return CLIENT_FALLBACK_INSIGHTS;

    } catch (err: any) {
      console.error('[AIService] getInsights error:', err?.message);
      return CLIENT_FALLBACK_INSIGHTS;
    }
  }

  /**
   * Fetch AI-generated actions for the current user.
   * Never throws.
   */
  async getActions(): Promise<AIAction[]> {
    try {
      const res = await api.get('/ai/actions', { timeout: 10000 });
      const data = res.data?.data;

      if (Array.isArray(data) && data.length > 0) return data;
      return this._defaultActions();

    } catch (err: any) {
      console.error('[AIService] getActions error:', err?.message);
      return this._defaultActions();
    }
  }

  /**
   * Fetch AI notifications and smart suggestions.
   * Never throws.
   */
  async getNotifications(): Promise<{ notifications: AINotification[]; suggestions: any[] }> {
    try {
      const res = await api.get('/ai/notifications', { timeout: 10000 });
      const data = res.data?.data;

      if (data?.notifications) return data;
      return { notifications: [], suggestions: [] };

    } catch (err: any) {
      console.error('[AIService] getNotifications error:', err?.message);
      return { notifications: [], suggestions: [] };
    }
  }

  /**
   * Fetch AI context for the current user.
   * Never throws.
   */
  async getContext(): Promise<any> {
    try {
      const res = await api.get('/ai/context', { timeout: 10000 });
      return res.data?.data || null;
    } catch (err: any) {
      console.error('[AIService] getContext error:', err?.message);
      return null;
    }
  }

  /**
   * Fetch AI provider status.
   * Never throws.
   */
  async getStatus(): Promise<AIStatus> {
    try {
      const res = await api.get('/ai/status', { timeout: 5000 });
      return res.data?.data || this._defaultStatus();
    } catch {
      return this._defaultStatus();
    }
  }

  /**
   * Get AI context for a specific business.
   * Never throws.
   */
  async getBusinessContext(businessId: string): Promise<any> {
    try {
      const res = await api.get(`/ai/context/business/${businessId}`, { timeout: 10000 });
      return res.data?.data || null;
    } catch (err: any) {
      console.error('[AIService] getBusinessContext error:', err?.message);
      return null;
    }
  }

  // ── Private helpers ──────────────────────────────────────────────────

  private _defaultActions(): AIAction[] {
    return [
      {
        id: 'default_dashboard', type: 'review_dashboard',
        title: 'Review Your Dashboard',
        description: 'Check your business performance and key metrics.',
        priority: 'medium', ctaLabel: 'Go to Dashboard', route: '/dashboard'
      },
      {
        id: 'default_docs', type: 'upload_docs',
        title: 'Organize Your Documents',
        description: 'Upload and categorize your business documents.',
        priority: 'low', ctaLabel: 'Open Documents', route: '/documents'
      }
    ];
  }

  private _defaultStatus(): AIStatus {
    return {
      gemini: false,
      openai: false,
      anthropic: false,
      active: 'VaultAI Local',
      fallbackAvailable: true,
      message: 'VaultAI is running in standard intelligence mode. Taliv is still making me smarter.'
    };
  }
}

export const aiService = new AIService();
export default aiService;

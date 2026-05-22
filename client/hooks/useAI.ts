/**
 * useAI.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Reusable React hook for all VaultEXP AI interactions.
 *
 * Features:
 *  - Chat with message history
 *  - Loading states ('idle' | 'thinking' | 'analyzing' | 'preparing')
 *  - Error resilience — errors are caught, never crash the component
 *  - Abort support — cancel in-flight requests on unmount
 *  - Insights, actions, and notifications fetching
 * ─────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import aiService, { type AIChatResponse, type AIInsightsResponse, type AIAction, type AINotification } from '@/lib/ai/aiService';

// ── Types ──────────────────────────────────────────────────────────────────

export type AILoadingState = 'idle' | 'thinking' | 'analyzing' | 'preparing';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isFallback?: boolean;
}

export interface UseAIOptions {
  /** Modules to include in AI context (default: ['all']) */
  modules?: string[];
  /** Initial welcome message. Set to null to disable. */
  welcomeMessage?: string | null;
}

export interface UseAIChatReturn {
  messages: AIMessage[];
  loadingState: AILoadingState;
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
  setMessages: React.Dispatch<React.SetStateAction<AIMessage[]>>;
}

export interface UseAIDataReturn {
  insights: AIInsightsResponse | null;
  actions: AIAction[];
  notifications: AINotification[];
  suggestions: any[];
  isLoadingInsights: boolean;
  isLoadingActions: boolean;
  isLoadingNotifications: boolean;
  refetchInsights: () => void;
  refetchActions: () => void;
  refetchNotifications: () => void;
}

// ── Loading state messages ─────────────────────────────────────────────────

const LOADING_MESSAGES: Record<AILoadingState, string> = {
  idle:      '',
  thinking:  'VaultAI is thinking...',
  analyzing: 'VaultAI is analyzing your data...',
  preparing: 'VaultAI is preparing a response...',
};

export function getLoadingMessage(state: AILoadingState): string {
  return LOADING_MESSAGES[state];
}

// ── Cycle through loading states for a realistic feel ─────────────────────

function useLoadingStateCycle(isLoading: boolean): AILoadingState {
  const [state, setState] = useState<AILoadingState>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setState('idle');
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    setState('thinking');
    timerRef.current = setTimeout(() => {
      if (isLoading) setState('analyzing');
      timerRef.current = setTimeout(() => {
        if (isLoading) setState('preparing');
      }, 2500);
    }, 1500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoading]);

  return state;
}

// ── useAIChat ──────────────────────────────────────────────────────────────

/**
 * Hook for AI chat functionality.
 *
 * @example
 * const { messages, isLoading, loadingState, sendMessage } = useAIChat({
 *   welcomeMessage: "Hi! I'm VaultAI. How can I help?",
 *   modules: ['invoices', 'business']
 * });
 */
export function useAIChat(options: UseAIOptions = {}): UseAIChatReturn {
  const {
    modules = ['all'],
    welcomeMessage = `Hello! I'm VaultAI, your intelligent business assistant. Ask me about your invoices, business performance, properties, investments, taxes, or anything VaultEXP-related.`
  } = options;

  const [isLoading, setIsLoading]   = useState(false);
  const loadingState                = useLoadingStateCycle(isLoading);
  const abortRef                    = useRef<AbortController | null>(null);

  const initialMessages: AIMessage[] = welcomeMessage
    ? [{ id: 'welcome', role: 'assistant', content: welcomeMessage, timestamp: new Date() }]
    : [];

  const [messages, setMessages] = useState<AIMessage[]>(initialMessages);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    // Add user message immediately
    const userMsg: AIMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const result: AIChatResponse = await aiService.chat(
        trimmed,
        modules,
        abortRef.current.signal
      );

      // Don't add message if cancelled
      if (abortRef.current?.signal.aborted) return;

      if (result.reply) {
        setMessages(prev => [...prev, {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: result.reply,
          timestamp: new Date(),
          isFallback: result.isFallback
        }]);
      }
    } catch {
      // Should not happen (aiService never throws) but guard anyway
      setMessages(prev => [...prev, {
        id: `ai_err_${Date.now()}`,
        role: 'assistant',
        content: `Taliv is still making me smarter. Please try again in a moment.`,
        timestamp: new Date(),
        isFallback: true
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, modules]);

  const clearHistory = useCallback(() => {
    abortRef.current?.abort();
    setMessages(
      welcomeMessage
        ? [{ id: 'welcome', role: 'assistant', content: welcomeMessage, timestamp: new Date() }]
        : []
    );
    setIsLoading(false);
  }, [welcomeMessage]);

  return { messages, loadingState, isLoading, sendMessage, clearHistory, setMessages };
}

// ── useAIData ──────────────────────────────────────────────────────────────

/**
 * Hook for fetching AI insights, actions, and notifications.
 *
 * @example
 * const { insights, actions, isLoadingInsights } = useAIData();
 */
export function useAIData(): UseAIDataReturn {
  const [insights,              setInsights]              = useState<AIInsightsResponse | null>(null);
  const [actions,               setActions]               = useState<AIAction[]>([]);
  const [notifications,         setNotifications]         = useState<AINotification[]>([]);
  const [suggestions,           setSuggestions]           = useState<any[]>([]);
  const [isLoadingInsights,     setIsLoadingInsights]     = useState(false);
  const [isLoadingActions,      setIsLoadingActions]      = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const fetchInsights = useCallback(async () => {
    setIsLoadingInsights(true);
    try {
      const data = await aiService.getInsights();
      setInsights(data);
    } finally {
      setIsLoadingInsights(false);
    }
  }, []);

  const fetchActions = useCallback(async () => {
    setIsLoadingActions(true);
    try {
      const data = await aiService.getActions();
      setActions(data);
    } finally {
      setIsLoadingActions(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setIsLoadingNotifications(true);
    try {
      const data = await aiService.getNotifications();
      setNotifications(data.notifications || []);
      setSuggestions(data.suggestions || []);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
    fetchActions();
    fetchNotifications();
  }, [fetchInsights, fetchActions, fetchNotifications]);

  return {
    insights,
    actions,
    notifications,
    suggestions,
    isLoadingInsights,
    isLoadingActions,
    isLoadingNotifications,
    refetchInsights:      fetchInsights,
    refetchActions:       fetchActions,
    refetchNotifications: fetchNotifications,
  };
}

// ── useAIStatus ────────────────────────────────────────────────────────────

/**
 * Hook to get the current AI provider status.
 */
export function useAIStatus() {
  const [status, setStatus] = useState<{ active: string; message: string; gemini: boolean } | null>(null);

  useEffect(() => {
    aiService.getStatus().then(setStatus).catch(() => {});
  }, []);

  return status;
}

// ── Default export ─────────────────────────────────────────────────────────

export default useAIChat;

import { create } from 'zustand';

export type ActionType = 'expense' | 'document' | 'tenant' | 'property' | 'business' | 'investment' | 'wallet' | 'transaction' | 'card' | 'alert' | 'invoice' | null;

interface ActionState {
  activeAction: ActionType;
  isOpen: boolean;
  openAction: (type: ActionType) => void;
  closeAction: () => void;
}

export const useActionStore = create<ActionState>((set) => ({
  activeAction: null,
  isOpen: false,
  openAction: (type) => set({ activeAction: type, isOpen: true }),
  closeAction: () => set({ activeAction: null, isOpen: false }),
}));

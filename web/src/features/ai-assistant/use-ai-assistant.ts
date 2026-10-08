import { create } from 'zustand';

export type AssistantTab = 'search' | 'voice' | 'chat' | 'graphs';

interface AiAssistantState {
  isOpen: boolean;
  activeTab: AssistantTab;
  searchQuery: string;
  initialChatPrompt?: string;
  open: (tab?: AssistantTab, query?: string) => void;
  close: () => void;
  toggle: (tab?: AssistantTab) => void;
  setActiveTab: (tab: AssistantTab) => void;
  setSearchQuery: (query: string) => void;
  setInitialChatPrompt: (prompt?: string) => void;
}

export const useAiAssistant = create<AiAssistantState>((set) => ({
  isOpen: false,
  activeTab: 'search',
  searchQuery: '',
  initialChatPrompt: undefined,
  open: (tab = 'search', query = '') => set({ isOpen: true, activeTab: tab, searchQuery: query }),
  close: () => set({ isOpen: false }),
  toggle: (tab) =>
    set((state) => ({
      isOpen: !state.isOpen,
      activeTab: tab || state.activeTab,
    })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setInitialChatPrompt: (prompt) => set({ initialChatPrompt: prompt }),
}));

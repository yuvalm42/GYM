import { create } from 'zustand';

type SessionUiState = {
  refreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
};

export const useSessionStore = create<SessionUiState>((set) => ({
  refreshing: false,
  setRefreshing: (refreshing) => set({ refreshing }),
}));

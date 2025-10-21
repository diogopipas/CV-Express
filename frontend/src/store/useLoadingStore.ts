import { create } from 'zustand';

interface LoadingStore {
  isLoading: boolean;
  loadingMessage: string;
  loadingSubMessage: string;
  setLoading: (loading: boolean, message?: string, subMessage?: string) => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  isLoading: false,
  loadingMessage: 'Processing...',
  loadingSubMessage: '',
  
  setLoading: (loading, message = 'Processing...', subMessage = '') => 
    set({ 
      isLoading: loading, 
      loadingMessage: message, 
      loadingSubMessage: subMessage 
    }),
}));


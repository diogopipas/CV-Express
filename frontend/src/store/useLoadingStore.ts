import { create } from 'zustand';

interface LoadingStore {
  isLoading: boolean;
  loadingMessage: string;
  loadingSubMessage: string;
  loadingType: 'default' | 'scraping' | 'upload' | 'analysis';
  setLoading: (loading: boolean, message?: string, subMessage?: string, type?: 'default' | 'scraping' | 'upload' | 'analysis') => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  isLoading: false,
  loadingMessage: 'Processing...',
  loadingSubMessage: '',
  loadingType: 'default',
  
  setLoading: (loading, message = 'Processing...', subMessage = '', type = 'default') => 
    set({ 
      isLoading: loading, 
      loadingMessage: message, 
      loadingSubMessage: subMessage,
      loadingType: type
    }),
}));


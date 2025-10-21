import { create } from 'zustand';
import { Application } from '../services/api';

interface ApplicationStore {
  applications: Application[];
  selectedApplication: Application | null;
  isLoading: boolean;
  filters: {
    status?: string;
    priority?: string;
    search?: string;
  };
  sortBy: string;
  order: 'asc' | 'desc';
  
  setApplications: (applications: Application[]) => void;
  setSelectedApplication: (application: Application | null) => void;
  setLoading: (loading: boolean) => void;
  setFilters: (filters: Partial<ApplicationStore['filters']>) => void;
  setSorting: (sortBy: string, order: 'asc' | 'desc') => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  removeApplication: (id: string) => void;
  addApplication: (application: Application) => void;
}

export const useApplicationStore = create<ApplicationStore>((set) => ({
  applications: [],
  selectedApplication: null,
  isLoading: false,
  filters: {
    status: 'all',
  },
  sortBy: 'appliedDate',
  order: 'desc',
  
  setApplications: (applications) => set({ applications }),
  
  setSelectedApplication: (selectedApplication) => set({ selectedApplication }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  
  setSorting: (sortBy, order) => set({ sortBy, order }),
  
  updateApplication: (id, updates) => set((state) => ({
    applications: state.applications.map(app => 
      app._id === id ? { ...app, ...updates } : app
    ),
    selectedApplication: state.selectedApplication?._id === id 
      ? { ...state.selectedApplication, ...updates }
      : state.selectedApplication
  })),
  
  removeApplication: (id) => set((state) => ({
    applications: state.applications.filter(app => app._id !== id),
    selectedApplication: state.selectedApplication?._id === id 
      ? null 
      : state.selectedApplication
  })),
  
  addApplication: (application) => set((state) => ({
    applications: [application, ...state.applications]
  })),
}));


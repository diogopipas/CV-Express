import { create } from 'zustand';
import { Job } from '../services/api';

interface JobStore {
  jobs: Job[];
  savedJobs: Job[];
  isLoading: boolean;
  filters: {
    source?: string;
    location?: string;
    search?: string;
  };
  setJobs: (jobs: Job[]) => void;
  setSavedJobs: (jobs: Job[]) => void;
  setLoading: (loading: boolean) => void;
  setFilters: (filters: Partial<JobStore['filters']>) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  removeJob: (id: string) => void;
}

export const useJobStore = create<JobStore>((set) => ({
  jobs: [],
  savedJobs: [],
  isLoading: false,
  filters: {},
  
  setJobs: (jobs) => set({ jobs }),
  setSavedJobs: (savedJobs) => set({ savedJobs }),
  setLoading: (isLoading) => set({ isLoading }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  
  updateJob: (id, updates) => set((state) => ({
    jobs: state.jobs.map(job => job._id === id ? { ...job, ...updates } : job),
    savedJobs: state.savedJobs.map(job => job._id === id ? { ...job, ...updates } : job),
  })),
  
  removeJob: (id) => set((state) => ({
    jobs: state.jobs.filter(job => job._id !== id),
    savedJobs: state.savedJobs.filter(job => job._id !== id),
  })),
}));


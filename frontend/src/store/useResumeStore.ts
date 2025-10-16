import { create } from 'zustand';
import { Resume } from '../services/api';

interface ResumeStore {
  resumes: Resume[];
  latestResume: Resume | null;
  isLoading: boolean;
  setResumes: (resumes: Resume[]) => void;
  setLatestResume: (resume: Resume | null) => void;
  setLoading: (loading: boolean) => void;
  addResume: (resume: Resume) => void;
  updateResume: (id: string, updates: Partial<Resume>) => void;
  removeResume: (id: string) => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  resumes: [],
  latestResume: null,
  isLoading: false,
  
  setResumes: (resumes) => set({ resumes }),
  setLatestResume: (latestResume) => set({ latestResume }),
  setLoading: (isLoading) => set({ isLoading }),
  
  addResume: (resume) => set((state) => ({
    resumes: [resume, ...state.resumes],
    latestResume: resume.isLatest ? resume : state.latestResume,
  })),
  
  updateResume: (id, updates) => set((state) => ({
    resumes: state.resumes.map(resume => resume._id === id ? { ...resume, ...updates } : resume),
    latestResume: state.latestResume?._id === id ? { ...state.latestResume, ...updates } : state.latestResume,
  })),
  
  removeResume: (id) => set((state) => ({
    resumes: state.resumes.filter(resume => resume._id !== id),
    latestResume: state.latestResume?._id === id ? null : state.latestResume,
  })),
}));


import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  jobUrl: string;
  source: 'LinkedIn' | 'Indeed' | 'Glassdoor';
  postedDate?: string;
  scrapedDate: string;
  saved: boolean;
  tags: string[];
}

export interface ScrapeParams {
  keyword: string;
  location: string;
  sources?: ('LinkedIn' | 'Indeed' | 'Glassdoor')[];
}

export interface JobsResponse {
  success: boolean;
  data: Job[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Resume {
  _id: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  uploadDate: string;
  status: 'processing' | 'completed' | 'failed';
  extractedSkills: string[];
  suggestedRoles: string[];
  searchedTitles: string[];
  jobSearchesUsed: number;
  jobSearchesLimit: number;
  totalJobs: number;
  newJobs: number;
  appliedJobs: number;
  successfulApplications: number;
  failedApplications: number;
  inQueue: number;
  resumeUsageCount: number;
  resumeUsageLimit: number;
  plan: 'FREE' | 'PRO';
  isLatest: boolean;
}

export const jobService = {
  scrape: async (params: ScrapeParams) => {
    const response = await api.post('/scrape', params);
    return response.data;
  },

  getJobs: async (params?: {
    page?: number;
    limit?: number;
    source?: string;
    location?: string;
    search?: string;
  }) => {
    const response = await api.get<JobsResponse>('/jobs', { params });
    return response.data;
  },

  getSavedJobs: async () => {
    const response = await api.get<JobsResponse>('/jobs/saved');
    return response.data;
  },

  getJob: async (id: string) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  toggleSave: async (id: string) => {
    const response = await api.post(`/jobs/${id}/save`);
    return response.data;
  },

  deleteJob: async (id: string) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },
};

export const resumeService = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    const response = await api.post('/resumes/upload', formData);
    return response.data;
  },

  getResumes: async () => {
    const response = await api.get('/resumes');
    return response.data;
  },

  getLatestResume: async () => {
    const response = await api.get('/resumes/latest');
    return response.data;
  },

  getResume: async (id: string) => {
    const response = await api.get(`/resumes/${id}`);
    return response.data;
  },

  deleteResume: async (id: string) => {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  },

  updateStats: async (id: string, stats: Partial<Resume>) => {
    const response = await api.patch(`/resumes/${id}/stats`, stats);
    return response.data;
  },

  addSearchedTitle: async (id: string, title: string) => {
    const response = await api.post(`/resumes/${id}/search-title`, { title });
    return response.data;
  },
};

export default api;


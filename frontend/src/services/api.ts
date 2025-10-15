import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

export default api;


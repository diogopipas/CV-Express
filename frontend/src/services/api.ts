import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const { state } = JSON.parse(authStorage);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  country?: string;
  region?: string; // State/region/province
  description: string;
  salary?: string;
  jobUrl: string;
  source: 'Adzuna' | 'Arbeitnow' | 'JSearch' | 'Mock';
  postedDate?: string;
  scrapedDate: string;
  saved: boolean;
  tags: string[];
  resumeId?: string;
  requirements: string[];
  benefits: string[];
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';
  applicationDeadline?: string;
}

export interface ScrapeParams {
  keyword: string;
  location?: string; // Optional now - can search globally
  resumeId?: string;
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
  status: 'processing';
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

export interface Note {
  text: string;
  date: string;
  type: 'general' | 'interview' | 'follow-up' | 'offer' | 'rejection';
}

export interface Contact {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface TimelineEvent {
  action: string;
  date: string;
  details?: string;
}

export interface Application {
  _id: string;
  userId: string;
  jobId: Job;
  resumeId: Resume;
  status: 'pending' | 'applied' | 'interviewing' | 'offered' | 'rejected' | 'accepted' | 'withdrawn';
  appliedDate: string;
  coverLetter?: string;
  notes: Note[];
  interviewDate?: string;
  salaryOffered?: string;
  contacts: Contact[];
  documents: string[];
  timeline: TimelineEvent[];
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  submissionMethod: 'cv_express_extension' | 'manual' | 'external';
  externalApplicationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStats {
  total: number;
  pending: number;
  applied: number;
  interviewing: number;
  offered: number;
  rejected: number;
  accepted: number;
  successRate: number;
  avgResponseTime: number;
}

export interface ApplicationsResponse {
  success: boolean;
  data: Application[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const jobService = {
  scrape: async (params: ScrapeParams & { useCache?: boolean }) => {
    const response = await api.post('/scrape', params);
    return response.data;
  },

  getJobs: async (params?: {
    page?: number;
    limit?: number;
    source?: string;
    location?: string;
    country?: string;
    region?: string;
    search?: string;
    resumeId?: string;
  }) => {
    const response = await api.get<JobsResponse>('/jobs', { params });
    return response.data;
  },

  getJobsByResume: async (resumeId: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<JobsResponse>(`/jobs/resume/${resumeId}`, { params });
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

  getCountries: async () => {
    const response = await api.get<{ success: boolean; data: Array<{ country: string; count: number }> }>('/jobs/countries');
    return response.data;
  },

  detectLocation: async () => {
    const response = await api.get<{ success: boolean; data: { country: string; countryCode: string; city?: string; region?: string; isLocal: boolean; fallback?: boolean } }>('/jobs/detect-location');
    return response.data;
  },

  getRegions: async (country?: string) => {
    const response = await api.get<{ success: boolean; data: Array<{ region: string; count: number; country?: string }> }>('/jobs/regions', {
      params: { country }
    });
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

  getResumeDownloadUrl: (id: string) => {
    return `${API_BASE_URL}/resumes/${id}/download`;
  },

  getResumeBlob: async (id: string) => {
    const response = await api.get(`/resumes/${id}/download`, {
      responseType: 'blob',
    });
    return response;
  },
};

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  token: string;
}

export const authService = {
  register: async (credentials: RegisterCredentials) => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.put('/auth/password', data);
    return response.data;
  },
};

export const applicationService = {
  create: async (data: {
    jobId: string;
    resumeId: string;
    coverLetter?: string;
    submissionMethod?: 'cv_express_extension' | 'manual' | 'external';
  }) => {
    const response = await api.post('/applications', data);
    return response.data;
  },

  getApplications: async (params?: {
    status?: string;
    priority?: string;
    search?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<ApplicationsResponse>('/applications', { params });
    return response.data;
  },

  getApplication: async (id: string) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/applications/${id}/status`, { status });
    return response.data;
  },

  updateApplication: async (id: string, updates: Partial<Application>) => {
    const response = await api.patch(`/applications/${id}`, updates);
    return response.data;
  },

  addNote: async (id: string, note: { text: string; type?: string }) => {
    const response = await api.post(`/applications/${id}/notes`, note);
    return response.data;
  },

  deleteApplication: async (id: string) => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<{ success: boolean; data: ApplicationStats }>('/applications/stats');
    return response.data;
  },
};

export default api;


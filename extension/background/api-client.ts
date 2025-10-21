import { auth } from '../utils/auth';
import { storage } from '../utils/storage';
import { Resume, JobData } from '../utils/types';

/**
 * API client for communicating with CV-Express backend
 */
class APIClient {
  private readonly API_BASE_URL = 'http://localhost:5001/api';

  /**
   * Fetch user's latest resume
   */
  async fetchLatestResume(): Promise<Resume | null> {
    try {
      const headers = await auth.getAuthHeader();
      
      const response = await fetch(`${this.API_BASE_URL}/resumes/latest`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resume');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const resume: Resume = {
          _id: data.data._id,
          filename: data.data.filename,
          originalName: data.data.originalName,
          filePath: data.data.filePath,
          fileUrl: `${this.API_BASE_URL}/resumes/${data.data._id}/download`,
          extractedSkills: data.data.extractedSkills || [],
        };

        await storage.saveResume(resume);
        return resume;
      }

      return null;
    } catch (error) {
      console.error('Error fetching latest resume:', error);
      return null;
    }
  }

  /**
   * Download resume file as blob
   */
  async downloadResume(resumeId: string): Promise<Blob | null> {
    try {
      const headers = await auth.getAuthHeader();
      
      const response = await fetch(
        `${this.API_BASE_URL}/resumes/${resumeId}/download`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('Failed to download resume');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error downloading resume:', error);
      return null;
    }
  }

  /**
   * Create application in CV-Express
   */
  async createApplication(params: {
    jobData: JobData;
    coverLetter?: string;
    submissionMethod: 'cv_express_extension' | 'manual' | 'external';
  }): Promise<any> {
    try {
      const headers = await auth.getAuthHeader();
      const userData = await storage.getUserData();
      const resume = await storage.getResume();

      if (!resume) {
        throw new Error('No resume found');
      }

      // First, we need to create or find the job in the database
      // For now, we'll create a simplified version
      // In a full implementation, you'd want to check if the job already exists

      const response = await fetch(`${this.API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: params.jobData.url, // We'll use URL as a temporary identifier
          resumeId: resume._id,
          coverLetter: params.coverLetter,
          submissionMethod: params.submissionMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create application');
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  /**
   * Track extension usage
   */
  async trackUsage(eventType: string, metadata?: any): Promise<void> {
    try {
      const headers = await auth.getAuthHeader();
      
      await fetch(`${this.API_BASE_URL}/extension/track`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          metadata,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      // Silently fail tracking errors
      console.error('Error tracking usage:', error);
    }
  }

  /**
   * Get user profile data for auto-fill
   */
  async getUserProfile(): Promise<any> {
    try {
      const headers = await auth.getAuthHeader();
      
      const response = await fetch(`${this.API_BASE_URL}/extension/user-data`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
}

export const apiClient = new APIClient();


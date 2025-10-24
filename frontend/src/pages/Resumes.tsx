import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  FileText, 
  Trash2, 
  XCircle, 
  Zap,
  Briefcase,
  Activity,
  Play,
  Eye,
  Search,
  Target,
  Info,
  ListChecks,
  Mail,
  Clock,
  CheckCircle,
  Building2,
  MapPin,
  PlayCircle,
  MessageSquare,
  Calendar,
  ThumbsDown,
  Gift,
  ClipboardList,
  MailOpen
} from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore';
import { useJobStore } from '../store/useJobStore';
import { useLoadingStore } from '../store/useLoadingStore';
import { resumeService, jobService } from '../services/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../components/ui/dialog';
import UploadResumeDialog from '../components/UploadResumeDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchBar from '../components/SearchBar';
import JobList from '../components/JobList';
import SubscriptionPlansDialog from '../components/SubscriptionPlansDialog';
import { Card } from '../components/ui/card';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface QueueItem {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    salary?: string;
  };
  matchScore: number;
  matchReasons: Array<{
    category: string;
    score: number;
    details: string;
  }>;
  status: string;
  queuedAt: string;
}

interface Email {
  _id: string;
  from: string;
  subject: string;
  body: string;
  htmlBody?: string;
  receivedAt: string;
  isRead: boolean;
  category: 'general' | 'interview' | 'rejection' | 'offer' | 'followup' | 'assessment';
  applicationId?: {
    _id: string;
    jobId: {
      title: string;
      company: string;
    };
  };
}

const categoryIcons = {
  general: MessageSquare,
  interview: Calendar,
  rejection: ThumbsDown,
  offer: Gift,
  followup: Mail,
  assessment: ClipboardList
};

const categoryColors = {
  general: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  interview: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  rejection: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  offer: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  followup: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  assessment: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
};

const Resumes = () => {
  const location = useLocation();
  const { resumes, setResumes, setLatestResume, removeResume, addResume } = useResumeStore();
  const { jobs, setJobs, setLoading: setJobsLoading } = useJobStore();
  const { setLoading: setGlobalLoading } = useLoadingStore();
  const [loading, setLoading] = useState(true);
  const [uploadingDemo, setUploadingDemo] = useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [viewResumeDialogOpen, setViewResumeDialogOpen] = useState(false);
  const [resumeToView, setResumeToView] = useState<{ id: string; name: string; url: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;
  const [activeTab, setActiveTab] = useState<'search' | 'queue' | 'inbox'>('search');

  // Queue state
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [queueStats, setQueueStats] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [processing, setProcessing] = useState(false);

  // Inbox state
  const [emails, setEmails] = useState<Email[]>([]);
  const [emailStats, setEmailStats] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isReadFilter, setIsReadFilter] = useState<boolean | undefined>(undefined);

  // Load jobs for a specific resume
  const loadJobsForResume = async (resumeId: string) => {
    try {
      setJobsLoading(true);
      const response = await jobService.getJobsByResume(resumeId, {
        page: 1,
        limit: 10000 // Load all jobs for this resume
      });
      
      if (response.data && response.data.length > 0) {
        setJobs(response.data);
        setCurrentPage(1);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } else {
        setJobs([]);
        setCurrentPage(1);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading jobs for resume:', error);
      setJobs([]);
      setCurrentPage(1);
      setTotalPages(1);
    } finally {
      setJobsLoading(false);
    }
  };

  // Handle resume selection and load its jobs
  const handleResumeSelect = async (resumeId: string) => {
    if (resumeId !== selectedResumeId) {
      setSelectedResumeId(resumeId);
      // Save to localStorage for persistence across refreshes
      localStorage.setItem('selectedResumeId', resumeId);
      // Load jobs for this resume
      await loadJobsForResume(resumeId);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  useEffect(() => {
    if (activeTab === 'queue') {
      fetchQueue();
    } else if (activeTab === 'inbox') {
      fetchEmails();
      fetchEmailStats();
    }
  }, [activeTab, statusFilter, categoryFilter, isReadFilter]);

  useEffect(() => {
    // Check if navigated with a newly uploaded resume
    const state = (location as any).state as { 
      selectedResumeId?: string;
      newResumeId?: string;
    } | null;
    
    if (state?.newResumeId && resumes.length > 0) {
      // New resume uploaded - select it and load existing jobs
      setSelectedResumeId(state.newResumeId);
      localStorage.setItem('selectedResumeId', state.newResumeId);
      // Load jobs for this resume
      loadJobsForResume(state.newResumeId);
      // Clear the state to prevent re-selection on future visits
      window.history.replaceState({}, document.title);
    } else if (state?.selectedResumeId && resumes.length > 0) {
      setSelectedResumeId(state.selectedResumeId);
      localStorage.setItem('selectedResumeId', state.selectedResumeId);
      // Load jobs for this resume
      loadJobsForResume(state.selectedResumeId);
      // Clear the state to prevent re-selection on future visits
      window.history.replaceState({}, document.title);
    } else if (resumes.length > 0 && !selectedResumeId) {
      // Try to restore from localStorage first
      const savedResumeId = localStorage.getItem('selectedResumeId');
      const resumeToSelect = savedResumeId && resumes.find(r => r._id === savedResumeId)
        ? savedResumeId
        : (resumes.find(r => r.isLatest) || resumes[0])._id;
      
      setSelectedResumeId(resumeToSelect);
      localStorage.setItem('selectedResumeId', resumeToSelect);
      // Load jobs for the selected resume
      loadJobsForResume(resumeToSelect);
    }
  }, [resumes, location]);

  // Get paginated jobs
  const getPaginatedJobs = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return jobs.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to results
    setTimeout(() => {
      document.getElementById('search-results')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  const loadResumes = async () => {
    try {
      setLoading(true);
      const [resumesResponse, latestResponse] = await Promise.allSettled([
        resumeService.getResumes(),
        resumeService.getLatestResume(),
      ]);

      if (resumesResponse.status === 'fulfilled') {
        setResumes(resumesResponse.value.data);
      }
      if (latestResponse.status === 'fulfilled') {
        setLatestResume(latestResponse.value.data);
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteClick = (id: string, name: string) => {
    setResumeToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!resumeToDelete) return;

    try {
      setGlobalLoading(true, 'Deleting Resume...', 'Removing resume and associated data');
      setDeleteDialogOpen(false);
      
      await resumeService.deleteResume(resumeToDelete.id);
      removeResume(resumeToDelete.id);
      
      // Clear localStorage if we deleted the selected resume
      if (selectedResumeId === resumeToDelete.id) {
        localStorage.removeItem('selectedResumeId');
        setSelectedResumeId(null);
        setJobs([]);
      }
      
      setGlobalLoading(false);
      toast.success('Resume deleted successfully');
      setResumeToDelete(null);
    } catch (error) {
      console.error('Error deleting resume:', error);
      setGlobalLoading(false);
      toast.error('Failed to delete resume');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setResumeToDelete(null);
  };

  const handleDeleteAllClick = () => {
    setDeleteAllDialogOpen(true);
  };

  const handleDeleteAllConfirm = async () => {
    try {
      setGlobalLoading(true, 'Deleting All Resumes...', 'Removing all resumes and associated data');
      setDeleteAllDialogOpen(false);
      
      // Delete all resumes
      await Promise.all(resumes.map(resume => resumeService.deleteResume(resume._id)));
      
      // Clear the store and localStorage
      setResumes([]);
      setSelectedResumeId(null);
      setJobs([]);
      localStorage.removeItem('selectedResumeId');
      
      setGlobalLoading(false);
      toast.success('All resumes deleted successfully');
    } catch (error) {
      console.error('Error deleting all resumes:', error);
      setGlobalLoading(false);
      toast.error('Failed to delete all resumes');
    }
  };

  const handleDeleteAllCancel = () => {
    setDeleteAllDialogOpen(false);
  };

  const handleViewResume = async (id: string) => {
    try {
      const resume = resumes.find(r => r._id === id);
      if (!resume) {
        toast.error('Resume not found');
        return;
      }

      // Fetch the resume file with authentication
      const response = await resumeService.getResumeBlob(id);
      
      // Get the content type from response headers
      const contentType = response.headers['content-type'];
      
      // Create a blob URL from the response
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      setResumeToView({
        id,
        name: resume.originalName,
        url
      });
      setViewResumeDialogOpen(true);
    } catch (error) {
      console.error('Error viewing resume:', error);
      toast.error('Failed to open resume. Please try again.');
    }
  };

  const handleCloseViewResume = () => {
    if (resumeToView?.url) {
      window.URL.revokeObjectURL(resumeToView.url);
    }
    setViewResumeDialogOpen(false);
    setResumeToView(null);
  };

  const handleDemoButtonClick = () => {
    // Check if user has reached the 5 CV limit
    if (resumes.length >= 5) {
      // Show subscription plans to upgrade or prompt to delete
      setShowSubscriptionPlans(true);
    } else {
      // User has less than 5 CVs, proceed directly with demo
      handleUploadDemoResume();
    }
  };

  const handlePlanSelected = async (plan: 'free' | 'pro' | 'enterprise') => {
    setShowSubscriptionPlans(false);
    
    if (plan === 'free') {
      toast.info('Free plan - Please delete a CV to upload a new one', {
        description: 'Free plan allows up to 5 CVs'
      });
    } else {
      toast.success(`${plan.charAt(0).toUpperCase() + plan.slice(1)} plan selected!`, {
        description: 'Enjoy unlimited CVs and features'
      });
      // Proceed with demo upload after upgrading to paid plan
      await handleUploadDemoResume();
    }
  };

  const handleUploadDemoResume = async () => {
    try {
      setUploadingDemo(true);
      setGlobalLoading(true, 'Uploading Demo Resume...', 'Creating sample resume with skills analysis');
      
      // Create a demo resume content
      const demoResumeContent = `
JOHN DOE
Software Engineer
Email: john.doe@example.com | Phone: (555) 123-4567 | LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Results-driven Software Engineer with 5+ years of experience in full-stack development. Proven expertise in building scalable web applications using modern technologies. Strong problem-solving skills and ability to work in fast-paced environments.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, Java, SQL
Frontend: React, Vue.js, HTML5, CSS3, Tailwind CSS, Redux
Backend: Node.js, Express, Django, Spring Boot
Databases: MongoDB, PostgreSQL, MySQL, Redis
Tools & Technologies: Git, Docker, Kubernetes, AWS, CI/CD, REST APIs, GraphQL
Methodologies: Agile, Scrum, TDD, Microservices

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp Inc. | Jan 2021 - Present
• Led development of microservices architecture serving 1M+ users
• Improved application performance by 40% through code optimization
• Mentored team of 5 junior developers
• Implemented CI/CD pipelines reducing deployment time by 60%
• Built RESTful APIs and integrated third-party services

Full Stack Developer | StartupXYZ | Jun 2019 - Dec 2020
• Developed responsive web applications using React and Node.js
• Designed and implemented PostgreSQL database schemas
• Collaborated with cross-functional teams in Agile environment
• Reduced page load time by 50% through optimization techniques
• Implemented automated testing increasing code coverage to 85%

Software Developer | Digital Solutions Co. | May 2018 - May 2019
• Created web applications using JavaScript and Python
• Maintained and enhanced legacy codebases
• Participated in code reviews and team meetings
• Fixed critical bugs improving system stability
• Documented technical specifications and API endpoints

EDUCATION
Bachelor of Science in Computer Science
State University | 2014 - 2018

CERTIFICATIONS
• AWS Certified Solutions Architect
• MongoDB Certified Developer
• Certified Scrum Master

PROJECTS
E-Commerce Platform - Built scalable platform with React, Node.js, and MongoDB handling 100K+ transactions
Task Management System - Developed collaborative tool with real-time updates using WebSockets
AI Chatbot - Created intelligent chatbot using Python and natural language processing

ACHIEVEMENTS
• Employee of the Year 2022 at TechCorp Inc.
• Published article on microservices architecture in tech magazine
• Speaker at local JavaScript meetup`;

      // Create a blob from the text content
      const blob = new Blob([demoResumeContent], { type: 'text/plain' });
      
      // Create a File object from the blob
      const demoFile = new File([blob], 'Demo_Resume_John_Doe.txt', { 
        type: 'text/plain',
        lastModified: Date.now() 
      });
      
      // Upload the demo resume
      const response = await resumeService.upload(demoFile);
      const resume = response.data;
      addResume(resume);
      
      toast.success('🎉 Demo resume uploaded successfully!', {
        description: 'Use the search bar to find matching jobs'
      });
      
      // Select the newly uploaded resume
      setSelectedResumeId(resume._id);
      localStorage.setItem('selectedResumeId', resume._id);
      
      setGlobalLoading(false);
      await loadResumes();
    } catch (error: any) {
      console.error('Demo upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload demo resume');
      setGlobalLoading(false);
    } finally {
      setUploadingDemo(false);
    }
  };

  const handleSearch = async (keyword: string, location: string) => {
    if (!selectedResumeId) {
      toast.error('Please select a resume first');
      return;
    }

    try {
      setIsSearching(true);
      setJobsLoading(true);
      
      // Show scraping loading overlay
      setGlobalLoading(true, 'Searching for Jobs', `Looking for ${keyword} in ${location}`, 'scraping');
      
      toast.info('🔍 Searching for jobs...', {
        description: `Looking for ${keyword} in ${location}`,
        duration: 3000
      });

      const response = await jobService.scrape({
        keyword,
        location,
        resumeId: selectedResumeId,
        useCache: true // Use cache for manual searches too
      });

      const jobCount = response.data?.length || 0;
      const usedCache = response.usedCache || false;
      const queueInfo = response.queueInfo;
      
      if (jobCount > 0) {
        setJobs(response.data);
        setCurrentPage(1);
        setTotalPages(Math.ceil(jobCount / itemsPerPage));
        
        let description = usedCache 
          ? 'Loaded from cache (instant results!)'
          : response.message || 'Jobs saved to your account';
        
        // Add queue information if available
        if (queueInfo && queueInfo.queued > 0) {
          description += ` • ${queueInfo.queued} jobs auto-queued for review`;
        }
        
        toast.success(`✅ Found ${jobCount} matching ${jobCount === 1 ? 'job' : 'jobs'}!`, {
          description: description,
          duration: 5000
        });
        
        // Show additional queue info if jobs were queued
        if (queueInfo && queueInfo.queued > 0) {
          setTimeout(() => {
            toast.info(`🎯 Smart Match Complete`, {
              description: `${queueInfo.queued} jobs scored ${queueInfo.minMatchScore}%+ and were added to your application queue for review`,
              duration: 6000
            });
          }, 1000);
        }
        
        // Scroll to results
        setTimeout(() => {
          document.getElementById('search-results')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 300);
      } else {
        setJobs([]);
        setCurrentPage(1);
        setTotalPages(1);
        toast.warning('No jobs found', {
          description: 'Try different keywords or location',
          duration: 4000
        });
      }

      await loadResumes(); // Refresh resume stats
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error(error.response?.data?.message || 'Failed to search jobs');
      setJobs([]);
      setCurrentPage(1);
      setTotalPages(1);
    } finally {
      setIsSearching(false);
      setJobsLoading(false);
      setGlobalLoading(false);
    }
  };

  const handleJobSave = async (id: string) => {
    try {
      const response = await jobService.toggleSave(id);
      const updatedJob = response.data;
      setJobs(jobs.map(job => job._id === id ? updatedJob : job));
      toast.success(updatedJob.saved ? 'Job saved!' : 'Job unsaved');
    } catch (error) {
      console.error('Error toggling job save:', error);
      toast.error('Failed to save job');
    }
  };

  const handleJobDelete = async (id: string) => {
    try {
      await jobService.deleteJob(id);
      setJobs(jobs.filter(job => job._id !== id));
      toast.success('Job deleted');
      await loadResumes(); // Refresh resume stats
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  // Queue functions
  const fetchQueue = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/applications/queue`, {
        params: { status: statusFilter },
        headers: { Authorization: `Bearer ${token}` }
      });
      setQueueItems(response.data.data);
      setQueueStats(response.data.stats);
    } catch (error: any) {
      console.error('Fetch queue error:', error);
      toast.error('Failed to fetch queue');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/applications/queue/${id}/review`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Job ${action}d successfully`);
      fetchQueue();
    } catch (error: any) {
      toast.error(`Failed to ${action} job`);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) {
      toast.error('No jobs selected');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/applications/queue/bulk-approve`,
        { queueIds: Array.from(selectedIds) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${selectedIds.size} jobs approved`);
      setSelectedIds(new Set());
      fetchQueue();
    } catch (error: any) {
      toast.error('Failed to bulk approve');
    }
  };

  const handleProcessQueue = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/applications/queue/process`,
        { batchSize: 10 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      fetchQueue();
    } catch (error: any) {
      toast.error('Failed to process queue');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteQueue = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/applications/queue/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Removed from queue');
      fetchQueue();
    } catch (error: any) {
      toast.error('Failed to remove from queue');
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  // Inbox functions
  const fetchEmails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params: any = {};
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (isReadFilter !== undefined) params.isRead = isReadFilter;

      const response = await axios.get(`${API_URL}/emails`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmails(response.data.data);
    } catch (error: any) {
      console.error('Fetch emails error:', error);
      toast.error('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/emails/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmailStats(response.data.data);
    } catch (error: any) {
      console.error('Fetch stats error:', error);
    }
  };


  const handleToggleRead = async (email: Email) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/emails/${email._id}/read`,
        { isRead: !email.isRead },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Marked as ${!email.isRead ? 'read' : 'unread'}`);
      fetchEmails();
      fetchEmailStats();
    } catch (error: any) {
      toast.error('Failed to update email');
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/emails/${emailId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Email deleted');
      fetchEmails();
      fetchEmailStats();
    } catch (error: any) {
      toast.error('Failed to delete email');
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Preparing your resume dashboard..." />
      </div>
    );
  }

  const selectedResume = resumes.find(r => r._id === selectedResumeId);

  return (
    <div className="space-y-6 pb-12">
      {/* Compact Hero Header with Tabs */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border border-primary/20">
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
                {activeTab === 'search' && <Search className="h-6 w-6 text-primary" />}
                {activeTab === 'queue' && <ListChecks className="h-6 w-6 text-primary" />}
                {activeTab === 'inbox' && <Mail className="h-6 w-6 text-primary" />}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {activeTab === 'search' && 'Search Jobs'}
                  {activeTab === 'queue' && 'Application Queue'}
                  {activeTab === 'inbox' && 'Inbox'}
              </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTab === 'search' && 'AI-powered job search tailored to your resume'}
                  {activeTab === 'queue' && 'Review and approve matched jobs'}
                  {activeTab === 'inbox' && 'Emails sent to your dedicated application address'}
              </p>
              </div>
            </div>
            {activeTab === 'search' && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleDemoButtonClick}
                  disabled={uploadingDemo}
                  className="hidden md:flex"
                >
                  {uploadingDemo ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Demo
                    </>
                  )}
                </Button>
                <UploadResumeDialog />
              </div>
            )}
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 border-b border-border/50">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'search'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Search className="h-4 w-4" />
              Search Jobs
            </button>
            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'inbox'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail className="h-4 w-4" />
              Inbox
              {emailStats?.unread > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {emailStats.unread}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'queue'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <ListChecks className="h-4 w-4" />
              Queue
            </button>
          </div>
        </div>
      </div>


      {/* Tab Content */}
      {activeTab === 'queue' ? (
        <>
          {/* Queue Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {selectedIds.size > 0 && (
                <Button onClick={handleBulkApprove}>
                  Approve Selected ({selectedIds.size})
                </Button>
              )}
              {queueStats?.approved > 0 && (
                <Button onClick={handleProcessQueue} disabled={processing}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {processing ? 'Processing...' : `Process ${queueStats.approved} Approved`}
                </Button>
              )}
            </div>
          </div>

          {/* Queue Stats */}
          {queueStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(queueStats).map(([key, value]: any) => (
                <Card key={key} className="p-4">
                  <p className="text-sm text-muted-foreground capitalize">{key.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Queue Filters */}
          <Card className="p-4">
            <div className="flex gap-2">
              {['pending_review', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm capitalize ${
                    statusFilter === status
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </Card>

          {/* Queue Items */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            </div>
          ) : queueItems.length === 0 ? (
            <Card className="p-12 text-center">
              <Clock className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Jobs in Queue</h3>
              <p className="text-sm text-muted-foreground">
                {statusFilter === 'pending_review'
                  ? 'Add jobs to your queue from the Search Jobs tab'
                  : `No jobs with status: ${statusFilter}`}
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {queueItems.map((item) => (
                <Card key={item._id} className="p-6">
                  <div className="flex gap-4">
                    {statusFilter === 'pending_review' && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item._id)}
                          onChange={() => toggleSelection(item._id)}
                          className="w-5 h-5 cursor-pointer"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      {/* Job Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold">{item.jobId.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {item.jobId.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {item.jobId.location}
                            </span>
                            {item.jobId.salary && <span>{item.jobId.salary}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getMatchColor(item.matchScore)}`}>
                            {item.matchScore}%
                          </div>
                          <div className="text-xs text-muted-foreground">Match Score</div>
                        </div>
                      </div>

                      {/* Match Reasons */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        {item.matchReasons.map((reason, idx) => (
                          <div key={idx} className="bg-muted rounded-lg p-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium capitalize">{reason.category}</span>
                              <span className="text-xs font-bold">{reason.score}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{reason.details}</p>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      {statusFilter === 'pending_review' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReview(item._id, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(item._id, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteQueue(item._id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : activeTab === 'inbox' ? (
        <>
          {/* Email Stats */}
          {emailStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{emailStats.total}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-blue-600">{emailStats.unread}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Interviews</p>
                <p className="text-2xl font-bold text-purple-600">{emailStats.interviews}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Offers</p>
                <p className="text-2xl font-bold text-green-600">{emailStats.offers}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Rejections</p>
                <p className="text-2xl font-bold text-red-600">{emailStats.rejections}</p>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex gap-1 mb-2 flex-wrap">
              {['all', 'interview', 'offer', 'rejection', 'assessment', 'followup', 'general'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-1 rounded text-xs capitalize ${
                    categoryFilter === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIsReadFilter(undefined)}
                className={`px-2 py-1 rounded text-xs ${
                  isReadFilter === undefined ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setIsReadFilter(false)}
                className={`px-2 py-1 rounded text-xs ${
                  isReadFilter === false ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setIsReadFilter(true)}
                className={`px-2 py-1 rounded text-xs ${
                  isReadFilter === true ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                Read
              </button>
            </div>
          </Card>

          {/* Email List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              </div>
            ) : emails.length === 0 ? (
              <Card className="p-12 text-center">
                <Mail className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Emails Found</h3>
                <p className="text-sm text-muted-foreground">
                  No emails match your current filters
                </p>
              </Card>
            ) : (
              emails.map((email) => {
                const Icon = categoryIcons[email.category];
                return (
                  <Card key={email._id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-5 h-5" />
                          <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[email.category]}`}>
                            {email.category}
                          </span>
                          {!email.isRead && (
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          )}
                        </div>
                        <h2 className={`text-xl font-bold mb-2 ${!email.isRead ? 'text-blue-600' : ''}`}>
                          {email.subject}
                        </h2>
                        <p className="text-sm text-muted-foreground mb-1">From: {email.from}</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {new Date(email.receivedAt).toLocaleString()}
                        </p>
                        {email.applicationId && (
                          <p className="text-sm text-muted-foreground mb-4">
                            Related to: {email.applicationId.jobId.title} at{' '}
                            {email.applicationId.jobId.company}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleRead(email)}
                        >
                          {email.isRead ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteEmail(email._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      {email.htmlBody ? (
                        <div
                          className="prose dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: email.htmlBody }}
                        />
                      ) : (
                        <div className="whitespace-pre-wrap text-sm">{email.body}</div>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </>
      ) : (
        <>
          {/* Search Jobs Tab Content */}
          {/* No Resumes State */}
          {resumes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 p-6 border border-primary/30">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-xl font-semibold">Start Your Job Search</h3>
              <p className="text-muted-foreground text-sm">
                Upload your resume to unlock AI-powered job matching and automated applications
            </p>
          </div>
            <div className="flex items-center gap-3">
                <UploadResumeDialog />
              <span className="text-sm text-muted-foreground">or</span>
                <Button 
                  variant="outline"
                  onClick={handleDemoButtonClick}
                  disabled={uploadingDemo}
                >
                  {uploadingDemo ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                    Try Demo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
        <>
          {/* Main Content: Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar: Resume Selector & Info */}
            <div className="lg:col-span-4 space-y-4">
              {/* Resume Selector Card */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Active Resume</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleDeleteAllClick}
                      disabled={resumes.length === 0}
                      className="h-8 px-2 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10"
                      title="Delete all resumes"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Delete All</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={loadResumes}
                      className="h-8 w-8 p-0"
                      title="Refresh resumes"
                    >
                      <Activity className="h-4 w-4" />
                    </Button>
                  </div>
                      </div>

                {/* Resume Tabs */}
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                  {resumes.map((resume) => (
                    <div
                      key={resume._id}
                      className={`w-full p-3 rounded-lg border transition-all ${
                        selectedResumeId === resume._id
                          ? 'bg-primary/10 border-primary/50'
                          : 'bg-muted/50 border-transparent hover:border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleResumeSelect(resume._id)}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        >
                          <div className={`p-2 rounded-lg ${
                            selectedResumeId === resume._id ? 'bg-primary/20' : 'bg-background'
                          }`}>
                            <FileText className={`h-4 w-4 ${
                              selectedResumeId === resume._id ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">
                                {resume.originalName.length > 18 
                                  ? resume.originalName.substring(0, 18) + '...' 
                                  : resume.originalName}
                              </span>
                              {resume.isLatest && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {resume.totalJobs} jobs
                            </div>
                          </div>
                        </button>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewResume(resume._id);
                            }}
                            className="h-7 w-7 p-0"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(resume._id, resume.originalName);
                            }}
                            className="h-7 w-7 p-0 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                            </div>
                          </div>

              {/* Selected Resume Details */}
              {selectedResume && (
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Resume Details</h3>
                  </div>

                  {/* Suggested Roles */}
                  {selectedResume.suggestedRoles && selectedResume.suggestedRoles.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-3.5 w-3.5 text-purple-400" />
                        <span className="text-xs font-medium text-muted-foreground">Suggested Roles</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                        {selectedResume.suggestedRoles.slice(0, 3).map((role, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                                      {role}
                                    </Badge>
                                  ))}
                        {selectedResume.suggestedRoles.length > 3 && (
                          <Badge variant="outline" className="text-xs opacity-60">
                            +{selectedResume.suggestedRoles.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                  {/* Top Skills */}
                  {selectedResume.extractedSkills && selectedResume.extractedSkills.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-3.5 w-3.5 text-teal-400" />
                        <span className="text-xs font-medium text-muted-foreground">Top Skills</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                        {selectedResume.extractedSkills.slice(0, 6).map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                        {selectedResume.extractedSkills.length > 6 && (
                          <Badge variant="secondary" className="text-xs opacity-60">
                            +{selectedResume.extractedSkills.length - 6}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                </div>
              )}
            </div>

            {/* Right Main Area: Search & Results */}
            <div className="lg:col-span-8 space-y-6">
              {/* Search Section */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Search for Jobs</h2>
                              </div>
                
                {selectedResumeId ? (
                  <>
                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-400">
                        Jobs are automatically searched in your location. Use the search below to find jobs worldwide in any field.
                      </p>
                    </div>
                    <SearchBar onSearch={handleSearch} isLoading={isSearching} />
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      Please select a resume to start searching for jobs
                    </p>
                              </div>
                )}
                                </div>

              {/* Search Results */}
              {jobs.length > 0 && (
                <div id="search-results" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Search Results</h2>
                      <p className="text-sm text-muted-foreground">
                        {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
                      </p>
                              </div>
                            </div>
                  <JobList 
                    jobs={getPaginatedJobs()}
                    onSave={handleJobSave}
                    onDelete={handleJobDelete}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}

              {/* Empty State for Search Results */}
              {!isSearching && jobs.length === 0 && selectedResumeId && (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="rounded-full bg-muted p-4 border border-border">
                      <Search className="h-8 w-8 text-muted-foreground" />
                      </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">No Results Yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Start searching to find jobs that match your resume
                      </p>
                    </div>
                  </div>
                </div>
              )}
              </div>
          </div>
        </>
          )}
        </>
      )}


      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-rose-500/20">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-rose-500/20 p-3 border border-rose-500/30">
                <Trash2 className="h-6 w-6 text-rose-400" />
              </div>
              <DialogTitle className="text-xl">Delete Resume</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">
                {resumeToDelete?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 my-2">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-rose-400">This will permanently delete:</p>
                <ul className="text-muted-foreground space-y-1 ml-1">
                  <li>• The resume file and all extracted data</li>
                  <li>• All associated job listings</li>
                  <li>• Application history and statistics</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleDeleteCancel}
              className="border-border/50 hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Resume
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Confirmation Dialog */}
      <Dialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-rose-500/20">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-rose-500/20 p-3 border border-rose-500/30">
                <Trash2 className="h-6 w-6 text-rose-400" />
              </div>
              <DialogTitle className="text-xl">Delete All Resumes</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">
                all {resumes.length} resume{resumes.length !== 1 ? 's' : ''}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 my-2">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-rose-400">This will permanently delete:</p>
                <ul className="text-muted-foreground space-y-1 ml-1">
                  <li>• All resume files and extracted data</li>
                  <li>• All associated job listings</li>
                  <li>• All application history and statistics</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleDeleteAllCancel}
              className="border-border/50 hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteAllConfirm}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete All Resumes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Resume Dialog */}
      <Dialog open={viewResumeDialogOpen} onOpenChange={(open) => !open && handleCloseViewResume()}>
        <DialogContent className="max-w-6xl h-[90vh] border-teal-500/20 p-0 flex flex-col">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-teal-500/20 p-3 border border-teal-500/30">
                <FileText className="h-6 w-6 text-teal-400" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl">{resumeToView?.name}</DialogTitle>
                <DialogDescription className="text-sm">
                  Your uploaded resume document
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseViewResume}
                className="border-border/50 hover:bg-muted"
              >
                Close
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 p-6 pt-4 overflow-hidden">
            {resumeToView?.url && (
              <iframe
                src={resumeToView.url}
                className="w-full h-full rounded-lg border border-border/50 bg-white"
                title="Resume Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscription Plans Dialog */}
      <SubscriptionPlansDialog
        open={showSubscriptionPlans}
        onOpenChange={setShowSubscriptionPlans}
        onPlanSelected={handlePlanSelected}
        title="CV Limit Reached"
        description="You've reached the 5 CV limit on the Free plan. Upgrade to Pro for unlimited CVs or delete an existing CV."
      />
    </div>
  );
};

export default Resumes;


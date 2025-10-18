import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  FileText, 
  Trash2, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target,
  Zap,
  Briefcase,
  Sparkles,
  Rocket,
  Activity,
  Award,
  BarChart3,
  Play,
  X,
  MapPin,
  Filter,
  Eye
} from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore';
import { useJobStore } from '../store/useJobStore';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import UploadResumeDialog from '../components/UploadResumeDialog';
import JobList from '../components/JobList';

const Resumes = () => {
  const location = useLocation();
  const { resumes, latestResume, setResumes, setLatestResume, removeResume, addResume } = useResumeStore();
  const { jobs, isLoading: jobsLoading, setJobs, setLoading: setJobsLoading } = useJobStore();
  const [loading, setLoading] = useState(true);
  const [uploadingDemo, setUploadingDemo] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<{ id: string; name: string } | null>(null);
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [viewResumeDialogOpen, setViewResumeDialogOpen] = useState(false);
  const [resumeToView, setResumeToView] = useState<{ id: string; name: string; url: string } | null>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  useEffect(() => {
    // Check if navigated with a specific resume ID to select
    const state = (location as any).state as { selectedResumeId?: string } | null;
    if (state?.selectedResumeId && resumes.length > 0) {
      setSelectedResumeId(state.selectedResumeId);
      // Clear the state to prevent re-selection on future visits
      window.history.replaceState({}, document.title);
    } else if (resumes.length > 0 && !selectedResumeId) {
      // Auto-select the latest resume when resumes load
      const latest = resumes.find(r => r.isLatest) || resumes[0];
      setSelectedResumeId(latest._id);
    }
  }, [resumes, location]);

  useEffect(() => {
    // Load jobs when selected resume changes
    if (selectedResumeId) {
      setCurrentPage(1); // Reset to page 1 when resume changes
      setCountryFilter('all'); // Reset country filter when resume changes
      loadJobsForResume(selectedResumeId, 1);
    }
  }, [selectedResumeId]);

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

  const loadJobsForResume = async (resumeId: string, page: number = 1) => {
    try {
      setJobsLoading(true);
      const response = await jobService.getJobsByResume(resumeId, { limit: 6, page });
      setJobs(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.pages);
        setTotalJobs(response.pagination.total);
        setCurrentPage(response.pagination.page);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setJobs([]);
      setTotalPages(1);
      setTotalJobs(0);
    } finally {
      setJobsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (selectedResumeId) {
      setCurrentPage(page);
      loadJobsForResume(selectedResumeId, page);
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
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setResumeToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!resumeToDelete) return;

    try {
      await resumeService.deleteResume(resumeToDelete.id);
      removeResume(resumeToDelete.id);
      toast.success('Resume deleted successfully');
      setDeleteDialogOpen(false);
      setResumeToDelete(null);
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setResumeToDelete(null);
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

  const handleUploadDemoResume = async () => {
    try {
      setUploadingDemo(true);
      
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
      
      toast.success('🎉 Demo resume uploaded successfully!');
      
      // Trigger job scraping if roles were suggested
      if (resume.suggestedRoles && resume.suggestedRoles.length > 0) {
        const primaryRole = resume.suggestedRoles[0];
        
        toast.info(`🔍 Finding real ${primaryRole} jobs from Adzuna...`, {
          description: 'Searching across thousands of listings',
          duration: 5000
        });
        
        try {
          const scrapeResponse = await jobService.scrape({
            keyword: primaryRole,
            location: 'United States',
            sources: ['LinkedIn', 'Indeed', 'Glassdoor'],
            resumeId: resume._id
          });
          
          const jobCount = scrapeResponse.data?.length || 0;
          
          if (jobCount > 0) {
            toast.success(`✅ Found ${jobCount} matching jobs!`);
            setSelectedResumeId(resume._id);
            await loadJobsForResume(resume._id, 1);
          } else {
            toast.warning('⚠️ No jobs found for this role', {
              description: 'Try searching manually or with different keywords',
              duration: 5000
            });
          }
        } catch (scrapeError) {
          console.error('Scraping error:', scrapeError);
          toast.warning('⚠️ Job search temporarily unavailable', {
            description: 'Please try again or use manual search',
            duration: 4000
          });
        }
      }
      
      await loadResumes();
    } catch (error: any) {
      console.error('Demo upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload demo resume');
    } finally {
      setUploadingDemo(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Extract country from location string
  const extractCountry = (location: string): string => {
    if (!location) return 'Unknown';
    
    // Common country mappings and patterns
    const countryPatterns: { [key: string]: string } = {
      'United States': 'United States',
      'USA': 'United States',
      'US': 'United States',
      'United Kingdom': 'United Kingdom',
      'UK': 'United Kingdom',
      'Canada': 'Canada',
      'Australia': 'Australia',
      'Germany': 'Germany',
      'France': 'France',
      'India': 'India',
      'Netherlands': 'Netherlands',
      'Spain': 'Spain',
      'Italy': 'Italy',
      'Brazil': 'Brazil',
      'Mexico': 'Mexico',
      'Singapore': 'Singapore',
      'Ireland': 'Ireland',
      'Switzerland': 'Switzerland',
      'Sweden': 'Sweden',
      'Poland': 'Poland',
      'Portugal': 'Portugal',
      'Austria': 'Austria',
      'Belgium': 'Belgium',
      'Denmark': 'Denmark',
      'Norway': 'Norway',
      'Finland': 'Finland',
    };

    // Check if location contains any country pattern
    for (const [pattern, country] of Object.entries(countryPatterns)) {
      if (location.includes(pattern)) {
        return country;
      }
    }

    // If no pattern matches, try to extract last part after comma
    const parts = location.split(',').map(p => p.trim());
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      // Check if last part matches any country
      for (const [pattern, country] of Object.entries(countryPatterns)) {
        if (lastPart === pattern) {
          return country;
        }
      }
      return lastPart;
    }

    return location;
  };

  // Get unique countries from jobs
  const getUniqueCountries = () => {
    const countries = jobs.map(job => extractCountry(job.location));
    const uniqueCountries = Array.from(new Set(countries)).sort();
    return uniqueCountries;
  };

  // Filter jobs by country
  const getFilteredJobs = () => {
    if (countryFilter === 'all') {
      return jobs;
    }
    return jobs.filter(job => extractCountry(job.location) === countryFilter);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 animate-spin"></div>
              <div className="absolute inset-1 rounded-full bg-background"></div>
              <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-teal-500 animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground animate-pulse">Preparing your resume dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500/10 via-blue-500/10 to-purple-500/10 border border-teal-500/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_70%)]"></div>
        <div className="relative p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                AI-Powered Job Automation
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Search Jobs
                </span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Transform your job search with intelligent resume analysis and automated applications
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={loadResumes}
                className="group border-teal-500/30 hover:border-teal-500/50 hover:bg-teal-500/10"
              >
                <Activity className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                Refresh
              </Button>
              <Button 
                variant="outline"
                onClick={handleUploadDemoResume}
                disabled={uploadingDemo}
                className="group border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-400"
              >
                {uploadingDemo ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    Try Demo
                  </>
                )}
              </Button>
              <UploadResumeDialog />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      {latestResume && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Application Analytics</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Applications */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-6 hover:border-blue-500/40 transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                    <Rocket className="h-5 w-5 text-blue-400" />
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40 text-xs">
                    Total
                  </Badge>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400">{latestResume.appliedJobs}</div>
                  <div className="text-sm text-muted-foreground mt-1">Applications Sent</div>
                </div>
              </div>
            </div>

            {/* Successful */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 p-6 hover:border-emerald-500/40 transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs">
                    Success
                  </Badge>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-400">{latestResume.successfulApplications}</div>
                  <div className="text-sm text-muted-foreground mt-1">Delivered Successfully</div>
                </div>
              </div>
            </div>

            {/* Failed */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500/10 to-rose-600/5 border border-rose-500/20 p-6 hover:border-rose-500/40 transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-rose-500/20 group-hover:bg-rose-500/30 transition-colors">
                    <XCircle className="h-5 w-5 text-rose-400" />
                  </div>
                  <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/40 text-xs">
                    Failed
                  </Badge>
                </div>
                <div>
                  <div className="text-3xl font-bold text-rose-400">{latestResume.failedApplications}</div>
                  <div className="text-sm text-muted-foreground mt-1">Need Attention</div>
                </div>
              </div>
            </div>

            {/* In Queue */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-6 hover:border-amber-500/40 transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-amber-500/20 group-hover:bg-amber-500/30 transition-colors">
                    <Clock className="h-5 w-5 text-amber-400" />
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-xs">
                    Pending
                  </Badge>
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-400">{latestResume.inQueue}</div>
                  <div className="text-sm text-muted-foreground mt-1">Queued & Processing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CV Switcher - Tabs to select which resume to view */}
      {resumes.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {resumes.length === 1 ? 'Your Resume' : 'Select Resume'}
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {resumes.map((resume) => (
                <button
                  key={resume._id}
                  onClick={() => setSelectedResumeId(resume._id)}
                  className={`relative flex-shrink-0 w-64 px-4 py-3 rounded-xl border transition-all duration-200 ${
                    selectedResumeId === resume._id
                      ? 'bg-gradient-to-br from-teal-500/20 to-blue-500/20 border-teal-500/50 shadow-lg shadow-teal-500/20'
                      : 'bg-card border-border/50 hover:border-teal-500/30 hover:bg-teal-500/5'
                  }`}
                >
                  <div className="flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`rounded-lg p-2 flex-shrink-0 ${
                        selectedResumeId === resume._id
                          ? 'bg-teal-500/30'
                          : 'bg-muted'
                      }`}>
                        <FileText className={`h-4 w-4 ${
                          selectedResumeId === resume._id ? 'text-teal-400' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium text-sm truncate ${
                            selectedResumeId === resume._id ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {resume.originalName.length > 20 
                              ? resume.originalName.substring(0, 20) + '...' 
                              : resume.originalName}
                          </span>
                          {resume.isLatest && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs px-1.5 py-0 flex-shrink-0">
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {resume.totalJobs} job{resume.totalJobs !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(resume._id, resume.originalName);
                      }}
                      className="p-1 rounded-md hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-all flex-shrink-0"
                      title="Delete resume"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {selectedResumeId === resume._id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resume Collection */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Resume Details</h2>
            <p className="text-sm text-muted-foreground">
              Detailed information about the selected resume
            </p>
          </div>
        </div>

        {resumes.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-muted-foreground/30 bg-gradient-to-br from-muted/30 to-muted/10 p-16">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]"></div>
            <div className="relative flex flex-col items-center space-y-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-teal-500/20"></div>
                <div className="relative rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 p-8 border border-teal-500/30">
                  <FileText className="h-12 w-12 text-teal-400" />
                </div>
              </div>
              <div className="space-y-3 max-w-md">
                <h3 className="text-xl font-semibold">Start Your Journey</h3>
                <p className="text-muted-foreground">
                  Upload your first resume to unlock AI-powered job matching, skill extraction, and automated applications.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <UploadResumeDialog />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>or</span>
                </div>
                <Button 
                  variant="outline"
                  onClick={handleUploadDemoResume}
                  disabled={uploadingDemo}
                  className="group border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10"
                >
                  {uploadingDemo ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
                      Loading Demo...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
                      <span className="text-purple-400">Try Demo Resume</span>
                      <Sparkles className="ml-2 h-3.5 w-3.5 text-purple-400 animate-pulse" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {resumes.filter(resume => resume._id === selectedResumeId).map((resume, index) => (
              <div 
                key={resume._id} 
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-teal-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/5"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/30 to-blue-500/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <button
                          onClick={() => handleViewResume(resume._id)}
                          className="relative rounded-xl bg-gradient-to-br from-teal-500/10 to-blue-500/10 p-3 border border-teal-500/20 hover:border-teal-500/40 hover:from-teal-500/20 hover:to-blue-500/20 transition-all cursor-pointer group/icon"
                          title="Click to view resume"
                        >
                          <FileText className="h-7 w-7 text-teal-400 group-hover/icon:scale-110 transition-transform" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{resume.originalName}</h3>
                            {resume.isLatest && (
                              <Badge className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/40">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            )}
                            <Badge variant="outline" className="capitalize border-teal-500/30 text-teal-400">
                              {resume.plan}
                            </Badge>
                          </div>

                          {/* Meta Info */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatDate(resume.uploadDate)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5" />
                              <span>{formatFileSize(resume.fileSize)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Award className="h-3.5 w-3.5" />
                              <span className="capitalize">{resume.status}</span>
                            </div>
                          </div>

                          {/* View Resume Button */}
                          <Button
                            onClick={() => handleViewResume(resume._id)}
                            variant="outline"
                            size="sm"
                            className="mt-2 w-fit border-teal-500/30 hover:border-teal-500/50 hover:bg-teal-500/10 text-teal-400 group/btn"
                          >
                            <Eye className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                            View Resume
                          </Button>
                        </div>

                        {resume.status === 'completed' && (
                          <>
                            {/* Searched Titles */}
                            {resume.searchedTitles.length > 0 && (
                              <div className="space-y-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="p-1 rounded bg-blue-500/20">
                                    <Target className="h-3.5 w-3.5 text-blue-400" />
                                  </div>
                                  <span className="text-sm font-medium">Targeted Roles</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {resume.searchedTitles.map((title, index) => (
                                    <Badge 
                                      key={index} 
                                      className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/40 hover:border-blue-500/60 transition-all"
                                    >
                                      {title}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Suggested Roles */}
                            {resume.suggestedRoles.length > 0 && (
                              <div className="space-y-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="p-1 rounded bg-purple-500/20">
                                    <Briefcase className="h-3.5 w-3.5 text-purple-400" />
                                  </div>
                                  <span className="text-sm font-medium">AI Suggestions</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Roles that match your profile
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {resume.suggestedRoles.slice(0, 8).map((role, index) => (
                                    <Badge 
                                      key={index} 
                                      variant="outline"
                                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-all"
                                    >
                                      {role}
                                    </Badge>
                                  ))}
                                  {resume.suggestedRoles.length > 8 && (
                                    <Badge variant="outline" className="opacity-60">
                                      +{resume.suggestedRoles.length - 8} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Skills */}
                            {resume.extractedSkills.length > 0 && (
                              <div className="space-y-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="p-1 rounded bg-teal-500/20">
                                    <Zap className="h-3.5 w-3.5 text-teal-400" />
                                  </div>
                                  <span className="text-sm font-medium">Extracted Skills</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {resume.extractedSkills.slice(0, 12).map((skill, index) => (
                                    <Badge 
                                      key={index} 
                                      variant="secondary"
                                      className="text-xs bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                  {resume.extractedSkills.length > 12 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{resume.extractedSkills.length - 12}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Job Stats Grid */}
                            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50">
                              <div className="text-center space-y-1">
                                <div className="text-xl font-bold text-teal-400">{resume.totalJobs}</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Jobs</div>
                              </div>
                              <div className="text-center space-y-1 border-x border-border/50">
                                <div className="text-xl font-bold text-emerald-400">{resume.newJobs}</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">New</div>
                              </div>
                              <div className="text-center space-y-1">
                                <div className="text-xl font-bold text-blue-400">
                                  {resume.jobSearchesUsed}/{resume.jobSearchesLimit}
                                </div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Searches</div>
                              </div>
                            </div>


                            {/* Usage Tracking */}
                            <div className="rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 p-4 space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Activity className="h-4 w-4 text-orange-400" />
                                  <span className="font-medium">Usage Metrics</span>
                                </div>
                                <Badge variant="outline" className="border-orange-500/40 text-orange-400 text-xs">
                                  {resume.plan}
                                </Badge>
                              </div>
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Resume Applications</span>
                                  <span className="font-medium">{resume.resumeUsageCount}/{resume.resumeUsageLimit}</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
                                    style={{ width: `${(resume.resumeUsageCount / resume.resumeUsageLimit) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            {/* Upgrade CTA */}
                            {resume.plan === 'FREE' && (
                              <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/30 p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <Rocket className="h-4 w-4 text-amber-400" />
                                      <span className="font-semibold text-sm">Unlock Pro Features</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      Unlimited searches, 10 resumes, priority support
                                    </p>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20"
                                  >
                                    Upgrade
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(resume._id, resume.originalName)}
                      className="text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Listings Section - Displayed directly under resumes */}
      <div id="job-listings-section" className="space-y-5 border-t border-border/30 pt-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Matching Jobs
              </span>
            </h2>
            <p className="text-sm text-muted-foreground">
              {totalJobs > 0 
                ? `${totalJobs} job${totalJobs !== 1 ? 's' : ''} found for ${resumes.find(r => r._id === selectedResumeId)?.originalName || 'this resume'}`
                : selectedResumeId 
                  ? 'No jobs found for this resume yet'
                  : 'Upload a resume to see matching jobs'}
            </p>
          </div>
          {jobs.length > 0 && selectedResumeId && (
            <Button 
              variant="outline" 
              onClick={() => loadJobsForResume(selectedResumeId, currentPage)}
              className="group border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/10"
            >
              <Activity className="mr-2 h-4 w-4 group-hover:animate-pulse" />
              Refresh Jobs
            </Button>
          )}
        </div>

        {/* Country Filter */}
        {jobs.length > 0 && getUniqueCountries().length > 1 && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-500/20">
                <MapPin className="h-4 w-4 text-teal-400" />
              </div>
              <span className="text-sm font-medium">Filter by Country</span>
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[250px] border-teal-500/30 focus:ring-teal-500/50">
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>All Countries</span>
                  </div>
                </SelectItem>
                {getUniqueCountries().map((country) => (
                  <SelectItem key={country} value={country}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{country}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {countryFilter !== 'all' && (
              <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/40">
                {getFilteredJobs().length} job{getFilteredJobs().length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )}

        {jobsLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 animate-spin"></div>
                  <div className="absolute inset-1 rounded-full bg-background"></div>
                  <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-teal-500 animate-pulse" />
                </div>
              </div>
              <p className="text-muted-foreground animate-pulse">Loading matching jobs...</p>
            </div>
          </div>
        ) : jobs.length > 0 ? (
          getFilteredJobs().length > 0 ? (
            <JobList 
              jobs={getFilteredJobs()} 
              onSave={handleJobSave} 
              onDelete={handleJobDelete}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          ) : (
            <div className="relative overflow-hidden rounded-3xl border border-dashed border-muted-foreground/30 bg-gradient-to-br from-muted/30 to-muted/10 p-12">
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]"></div>
              <div className="relative flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-6 border border-amber-500/30">
                  <MapPin className="h-10 w-10 text-amber-400" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-lg font-semibold">No Jobs in {countryFilter}</h3>
                  <p className="text-sm text-muted-foreground">
                    Try selecting a different country or view all countries to see available jobs.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setCountryFilter('all')}
                  className="border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/10"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Show All Countries
                </Button>
              </div>
            </div>
          )
        ) : (
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-muted-foreground/30 bg-gradient-to-br from-muted/30 to-muted/10 p-12">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]"></div>
            <div className="relative flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-6 border border-blue-500/30">
                <Briefcase className="h-10 w-10 text-blue-400" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-semibold">No Jobs Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a resume and our AI will automatically search for matching job opportunities across multiple platforms.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

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
                className="w-full h-full rounded-lg border border-border/50"
                title="Resume Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Resumes;


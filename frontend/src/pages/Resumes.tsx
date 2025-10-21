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
  Target
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

  // Load jobs for a specific resume
  const loadJobsForResume = async (resumeId: string) => {
    try {
      setJobsLoading(true);
      const response = await jobService.getJobsByResume(resumeId, {
        page: 1,
        limit: 100 // Load all jobs for this resume
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
    // Check if navigated with a newly uploaded resume
    const state = (location as any).state as { 
      selectedResumeId?: string;
      newResumeId?: string;
      scrapedJobs?: any[];
    } | null;
    
    if (state?.newResumeId && resumes.length > 0) {
      // New resume uploaded - select it and show scraped jobs
      setSelectedResumeId(state.newResumeId);
      localStorage.setItem('selectedResumeId', state.newResumeId);
      if (state.scrapedJobs && state.scrapedJobs.length > 0) {
        setJobs(state.scrapedJobs);
        setCurrentPage(1);
        setTotalPages(Math.ceil(state.scrapedJobs.length / itemsPerPage));
        // Scroll to results after a short delay
        setTimeout(() => {
          document.getElementById('search-results')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 500);
      }
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
      
      toast.success('🎉 Demo resume uploaded successfully!');
      
      // Trigger job scraping if roles were suggested
      if (resume.suggestedRoles && resume.suggestedRoles.length > 0) {
        const primaryRole = resume.suggestedRoles[0];
        
        setGlobalLoading(true, `Finding ${primaryRole} Jobs...`, 'Searching across multiple job platforms for the best matches');
        
        toast.info(`🔍 Finding real ${primaryRole} jobs from Adzuna...`, {
          description: 'Searching across thousands of listings',
          duration: 5000
        });
        
        try {
          const scrapeResponse = await jobService.scrape({
            keyword: primaryRole,
            location: 'United States',
            sources: ['LinkedIn', 'Indeed', 'Glassdoor'],
            resumeId: resume._id,
            useCache: true // Use cache for demo resume to save API resources
          });
          
          const jobCount = scrapeResponse.data?.length || 0;
          const usedCache = scrapeResponse.usedCache || false;
          
          if (jobCount > 0) {
            const successMessage = usedCache 
              ? `✅ Found ${jobCount} matching ${jobCount === 1 ? 'job' : 'jobs'}!`
              : `✅ Saved ${jobCount} matching ${jobCount === 1 ? 'job' : 'jobs'}!`;
            
            const description = usedCache 
              ? 'Loaded from cache (instant results!)'
              : scrapeResponse.message || '';
            
            toast.success(successMessage, {
              description: description,
              duration: 4000
            });
            setSelectedResumeId(resume._id);
            // Display the scraped jobs immediately
            const scrapedJobsData = scrapeResponse.data || [];
            setJobs(scrapedJobsData);
            setCurrentPage(1);
            setTotalPages(Math.ceil(scrapedJobsData.length / itemsPerPage));
            // Scroll to results
            setTimeout(() => {
              document.getElementById('search-results')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }, 500);
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

  const handleSearch = async (keyword: string, location: string, sources: ('LinkedIn' | 'Indeed' | 'Glassdoor')[]) => {
    if (!selectedResumeId) {
      toast.error('Please select a resume first');
      return;
    }

    try {
      setIsSearching(true);
      setJobsLoading(true);
      
      toast.info('🔍 Searching for jobs...', {
        description: `Looking for ${keyword} in ${location}`,
        duration: 3000
      });

      const response = await jobService.scrape({
        keyword,
        location,
        sources,
        resumeId: selectedResumeId,
        useCache: true // Use cache for manual searches too
      });

      const jobCount = response.data?.length || 0;
      const usedCache = response.usedCache || false;
      
      if (jobCount > 0) {
        setJobs(response.data);
        setCurrentPage(1);
        setTotalPages(Math.ceil(jobCount / itemsPerPage));
        
        const description = usedCache 
          ? 'Loaded from cache (instant results!)'
          : response.message || 'Jobs saved to your account';
        
        toast.success(`✅ Found ${jobCount} matching ${jobCount === 1 ? 'job' : 'jobs'}!`, {
          description: description,
          duration: 4000
        });
        
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
      {/* Compact Hero Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border border-primary/20">
        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Search Jobs
              </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  AI-powered job search tailored to your resume
              </p>
              </div>
            </div>
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
          </div>
        </div>
      </div>


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
                    <p className="text-sm text-muted-foreground">
                      Find jobs tailored to your resume. Select job field, location, and sources.
                    </p>
                    <SearchBar onSearch={handleSearch as any} isLoading={isSearching} />
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


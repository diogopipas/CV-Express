import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { BookmarkIcon, MapPin } from 'lucide-react';
import JobList from '../components/JobList';
import FilterPanel from '../components/FilterPanel';
import { jobService } from '../services/api';
import { useJobStore } from '../store/useJobStore';
import LoadingSpinner from '../components/LoadingSpinner';

const Saved = () => {
  const { savedJobs, isLoading, setSavedJobs, setLoading, updateJob, removeJob } = useJobStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedJobs, setPaginatedJobs] = useState<typeof savedJobs>([]);
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('scrapedDate');
  const jobListRef = useRef<HTMLDivElement>(null);
  const JOBS_PER_PAGE = 6;

  useEffect(() => {
    loadSavedJobs();
  }, []);

  useEffect(() => {
    // Update pagination when savedJobs or filter changes
    const filtered = getFilteredJobs();
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
    const endIndex = startIndex + JOBS_PER_PAGE;
    setPaginatedJobs(filtered.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filtered.length / JOBS_PER_PAGE));
  }, [savedJobs, currentPage, countryFilter, sortBy]);

  // Filter and sort jobs
  const getFilteredJobs = () => {
    let filtered = savedJobs;
    
    // Apply country filter
    if (countryFilter && countryFilter !== 'all') {
      filtered = filtered.filter(job => job.country === countryFilter);
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'company':
          return a.company.localeCompare(b.company);
        case 'scrapedDate':
        default:
          return new Date(b.scrapedDate).getTime() - new Date(a.scrapedDate).getTime();
      }
    });
    
    return sorted;
  };

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      const response = await jobService.getSavedJobs();
      setSavedJobs(response.data);
      setCurrentPage(1); // Reset to first page when reloading
    } catch (error) {
      console.error('Error loading saved jobs:', error);
      toast.error('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of job list after a brief delay to ensure content updates
    setTimeout(() => {
      if (jobListRef.current) {
        const yOffset = -20; // Small offset to keep some space at the top
        const element = jobListRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };

  // Reset to page 1 when country filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [countryFilter]);

  const handleSave = async (id: string) => {
    try {
      const response = await jobService.toggleSave(id);
      if (response.data.saved) {
        updateJob(id, { saved: true });
      } else {
        // Remove from saved list if unsaved
        removeJob(id);
      }
      toast.success(response.message);
    } catch (error) {
      toast.error('Failed to update job');
      console.error('Save error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await jobService.deleteJob(id);
      removeJob(id);
      toast.success('Job deleted successfully');
    } catch (error) {
      toast.error('Failed to delete job');
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div ref={jobListRef} className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <BookmarkIcon className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Saved Jobs
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {savedJobs.length > 0 
            ? `You have ${savedJobs.length} saved job${savedJobs.length !== 1 ? 's' : ''}`
            : 'No saved jobs yet. Start searching and save jobs you like!'
          }
        </p>
      </div>

      {/* Filters */}
      {savedJobs.length > 0 && (
        <div className="max-w-xs mx-auto">
          <FilterPanel 
            showCountryFilter={true}
            onFilterChange={(filters) => {
              if (filters.country !== undefined) {
                setCountryFilter(filters.country);
              }
              if (filters.sortBy !== undefined) {
                setSortBy(filters.sortBy);
              }
            }}
          />
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <LoadingSpinner size="md" text="Loading saved jobs..." />
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="text-center py-20">
          <BookmarkIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg text-muted-foreground">No saved jobs yet</p>
          <p className="text-sm text-muted-foreground mt-2">Search for jobs and save the ones you're interested in</p>
        </div>
      ) : paginatedJobs.length === 0 && countryFilter !== 'all' ? (
        <div className="text-center py-20">
          <MapPin className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg text-muted-foreground">No saved jobs in {countryFilter}</p>
          <p className="text-sm text-muted-foreground mt-2">Try selecting a different country</p>
        </div>
      ) : (
        <JobList 
          jobs={paginatedJobs} 
          onSave={handleSave} 
          onDelete={handleDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Saved;


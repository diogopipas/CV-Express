import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { BookmarkIcon, MapPin, Filter } from 'lucide-react';
import JobList from '../components/JobList';
import { jobService } from '../services/api';
import { useJobStore } from '../store/useJobStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import LoadingSpinner from '../components/LoadingSpinner';

const Saved = () => {
  const { savedJobs, isLoading, setSavedJobs, setLoading, updateJob, removeJob } = useJobStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedJobs, setPaginatedJobs] = useState<typeof savedJobs>([]);
  const [countryFilter, setCountryFilter] = useState<string>('all');
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
  }, [savedJobs, currentPage, countryFilter]);

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

  // Get unique countries from saved jobs
  const getUniqueCountries = () => {
    const countries = savedJobs.map(job => extractCountry(job.location));
    const uniqueCountries = Array.from(new Set(countries)).sort();
    return uniqueCountries;
  };

  // Filter jobs by country
  const getFilteredJobs = () => {
    if (countryFilter === 'all') {
      return savedJobs;
    }
    return savedJobs.filter(job => extractCountry(job.location) === countryFilter);
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

      {/* Country Filter */}
      {savedJobs.length > 0 && getUniqueCountries().length > 1 && (
        <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <MapPin className="h-4 w-4 text-orange-400" />
            </div>
            <span className="text-sm font-medium">Filter by Country</span>
          </div>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-[250px] border-orange-500/30 focus:ring-orange-500/50">
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
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/40">
              {getFilteredJobs().length} job{getFilteredJobs().length !== 1 ? 's' : ''}
            </Badge>
          )}
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


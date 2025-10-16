import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import SearchBar from '../components/SearchBar';
import JobList from '../components/JobList';
import FilterPanel from '../components/FilterPanel';
import { jobService } from '../services/api';
import { useJobStore } from '../store/useJobStore';

const Home = () => {
  const { jobs, isLoading, setJobs, setLoading, updateJob, filters, setFilters } = useJobStore();
  const [localFilters, setLocalFilters] = useState<{ source?: string; sortBy?: string }>({});

  useEffect(() => {
    // Load initial jobs
    loadJobs();
  }, []);

  useEffect(() => {
    // Reload when filters change
    if (Object.keys(filters).length > 0 || Object.keys(localFilters).length > 0) {
      loadJobs();
    }
  }, [filters, localFilters]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await jobService.getJobs({
        ...filters,
        ...localFilters,
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (keyword: string, location: string, sources: string[]) => {
    try {
      setLoading(true);
      toast.loading('Scraping jobs from selected sources...');
      
      const response = await jobService.scrape({
        keyword,
        location,
        sources: sources as any,
      });

      toast.dismiss();
      
      if (response.errors && response.errors.length > 0) {
        toast.warning(`Scraped ${response.count} jobs, but some sources failed`, {
          description: response.errors.map((e: any) => `${e.source}: ${e.error}`).join(', '),
        });
      } else {
        toast.success(`Successfully scraped ${response.count} jobs!`);
      }

      setJobs(response.data);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to scrape jobs. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id: string) => {
    try {
      const response = await jobService.toggleSave(id);
      updateJob(id, { saved: response.data.saved });
      toast.success(response.message);
    } catch (error) {
      toast.error('Failed to save job');
      console.error('Save error:', error);
    }
  };

  const handleFilterChange = (newFilters: { source?: string; sortBy?: string }) => {
    setLocalFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          Find Your Dream Job
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Search across LinkedIn, Indeed, and Glassdoor to find the perfect opportunity
        </p>
      </div>

      <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-4 shadow-sm">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <aside className="lg:col-span-1">
          <FilterPanel onFilterChange={handleFilterChange} />
        </aside>

        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading jobs...</p>
            </div>
          ) : (
            <JobList jobs={jobs} onSave={handleSave} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;


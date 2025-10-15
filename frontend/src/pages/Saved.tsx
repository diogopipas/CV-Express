import { useEffect } from 'react';
import { toast } from 'sonner';
import { BookmarkIcon } from 'lucide-react';
import JobList from '../components/JobList';
import { jobService } from '../services/api';
import { useJobStore } from '../store/useJobStore';

const Saved = () => {
  const { savedJobs, isLoading, setSavedJobs, setLoading, updateJob, removeJob } = useJobStore();

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      const response = await jobService.getSavedJobs();
      setSavedJobs(response.data);
    } catch (error) {
      console.error('Error loading saved jobs:', error);
      toast.error('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <BookmarkIcon className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading saved jobs...</p>
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="text-center py-20">
          <BookmarkIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg text-muted-foreground">No saved jobs yet</p>
          <p className="text-sm text-muted-foreground mt-2">Search for jobs and save the ones you're interested in</p>
        </div>
      ) : (
        <JobList jobs={savedJobs} onSave={handleSave} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default Saved;


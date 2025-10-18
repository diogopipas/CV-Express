import { Job } from '../services/api';
import JobCard from './JobCard';
import { Pagination } from './ui/pagination';

interface JobListProps {
  jobs: Job[];
  onSave?: (id: string) => void;
  onDelete?: (id: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const JobList = ({ jobs, onSave, onDelete, currentPage = 1, totalPages = 1, onPageChange }: JobListProps) => {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No jobs found. Try searching for something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} onSave={onSave} onDelete={onDelete} />
        ))}
      </div>
      
      {onPageChange && totalPages > 1 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={onPageChange} 
        />
      )}
    </div>
  );
};

export default JobList;


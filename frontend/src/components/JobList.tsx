import { Job } from '../services/api';
import JobCard from './JobCard';

interface JobListProps {
  jobs: Job[];
  onSave?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const JobList = ({ jobs, onSave, onDelete }: JobListProps) => {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No jobs found. Try searching for something!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <JobCard key={job._id} job={job} onSave={onSave} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default JobList;


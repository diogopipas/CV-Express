import { useState, useEffect } from 'react';
import { MapPin, Building2, DollarSign, Bookmark, Trash2, CheckCircle2, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Job, applicationService } from '../services/api';
import { cn } from '@/lib/utils';
import ApplyModal from './ApplyModal';
import { useResumeStore } from '../store/useResumeStore';
import { toast } from 'sonner';

interface JobCardProps {
  job: Job;
  onSave?: (id: string) => void;
  onDelete?: (id: string) => void;
  onApplicationCreate?: () => void;
}

const JobCard = ({ job, onSave, onDelete, onApplicationCreate }: JobCardProps) => {
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isCheckingApplication, setIsCheckingApplication] = useState(false);
  const { latestResume } = useResumeStore();

  useEffect(() => {
    // Check if user has already applied to this job
    const checkApplication = async () => {
      setIsCheckingApplication(true);
      try {
        const response = await applicationService.getApplications({
          limit: 1000 // Get all to check
        });
        const applied = response.data.some(app => app.jobId._id === job._id);
        setHasApplied(applied);
      } catch (error) {
        console.error('Error checking application:', error);
      } finally {
        setIsCheckingApplication(false);
      }
    };

    checkApplication();
  }, [job._id]);

  const handleApplyClick = () => {
    if (!latestResume) {
      toast.error('Please upload a resume first');
      return;
    }
    setApplyModalOpen(true);
  };

  const handleApplicationSuccess = () => {
    setHasApplied(true);
    if (onApplicationCreate) {
      onApplicationCreate();
    }
  };

  const getSourceColor = (source: string) => {
    const colors: { [key: string]: string } = {
      'LinkedIn': 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
      'Indeed': 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
      'Glassdoor': 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
      'Adzuna': 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800',
      'Arbeitnow': 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
      'JSearch': 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
      'Mock': 'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800'
    };
    return colors[source] || 'bg-muted/50 text-muted-foreground border border-border';
  };

  return (
    <>
    <Card className="group hover:shadow-md transition-all duration-200 hover:border-primary/30 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-1 group-hover:text-primary transition-colors">
              {job.title}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-1.5 text-xs">
              <Building2 className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{job.company}</span>
            </CardDescription>
          </div>
          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0', getSourceColor(job.source))}>
            {job.source}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 py-0 flex-1">
        <div className="flex items-center text-xs text-muted-foreground">
          <MapPin className="mr-1.5 h-3 w-3 flex-shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>

        {job.salary && (
          <div className="flex items-center text-xs text-muted-foreground">
            <DollarSign className="mr-1.5 h-3 w-3 flex-shrink-0" />
            <span className="truncate">{job.salary}</span>
          </div>
        )}

        <p className="text-xs text-muted-foreground line-clamp-2">
          {job.description}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between gap-1.5 pt-3">
        {hasApplied ? (
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex-1 h-8 text-xs" 
            disabled
          >
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Applied
          </Button>
        ) : (
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleApplyClick}
            disabled={isCheckingApplication}
            className="flex-1 h-8 text-xs"
          >
            <Briefcase className="mr-1 h-3 w-3" />
            {isCheckingApplication ? 'Loading...' : 'Apply'}
          </Button>
        )}
        
        {onSave && (
          <Button
            variant={job.saved ? "default" : "outline"}
            size="sm"
            onClick={() => onSave(job._id)}
            className="h-8 w-8 p-0"
          >
            <Bookmark className={cn("h-3.5 w-3.5", job.saved && "fill-current")} />
          </Button>
        )}

        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(job._id)}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </CardFooter>
    </Card>

    {latestResume && (
      <ApplyModal 
        job={job}
        resumeId={latestResume._id}
        open={applyModalOpen}
        onOpenChange={setApplyModalOpen}
        onSuccess={handleApplicationSuccess}
      />
    )}
  </>
  );
};

export default JobCard;


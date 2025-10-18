import { ExternalLink, MapPin, Building2, DollarSign, Bookmark, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Job } from '../services/api';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  onSave?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const JobCard = ({ job, onSave, onDelete }: JobCardProps) => {
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'LinkedIn':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Indeed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Glassdoor':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Adzuna':
        return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50 flex flex-col h-full">
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
        <Button variant="outline" size="sm" asChild className="flex-1 h-8 text-xs">
          <a href={job.jobUrl} target="_blank" rel="noopener noreferrer">
            View
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </Button>
        
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
  );
};

export default JobCard;


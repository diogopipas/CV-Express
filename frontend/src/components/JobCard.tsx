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
    <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {job.title}
            </CardTitle>
            <CardDescription className="mt-2 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {job.company}
            </CardDescription>
          </div>
          <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', getSourceColor(job.source))}>
            {job.source}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-2 h-4 w-4" />
          {job.location}
        </div>

        {job.salary && (
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="mr-2 h-4 w-4" />
            {job.salary}
          </div>
        )}

        <p className="text-sm text-muted-foreground line-clamp-3">
          {job.description}
        </p>

        <div className="text-xs text-muted-foreground">
          Scraped: {formatDate(job.scrapedDate)}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-2">
        <Button variant="outline" size="sm" asChild className="flex-1">
          <a href={job.jobUrl} target="_blank" rel="noopener noreferrer">
            View Job
            <ExternalLink className="ml-2 h-3 w-3" />
          </a>
        </Button>
        
        {onSave && (
          <Button
            variant={job.saved ? "default" : "outline"}
            size="sm"
            onClick={() => onSave(job._id)}
          >
            <Bookmark className={cn("h-4 w-4", job.saved && "fill-current")} />
          </Button>
        )}

        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(job._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default JobCard;


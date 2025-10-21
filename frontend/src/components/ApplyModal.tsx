import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Building2, MapPin, DollarSign, Briefcase, ExternalLink } from 'lucide-react';
import { Job, applicationService } from '../services/api';
import { useApplicationStore } from '../store/useApplicationStore';
import { toast } from 'sonner';

interface ApplyModalProps {
  job: Job;
  resumeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const ApplyModal = ({ job, resumeId, open, onOpenChange, onSuccess }: ApplyModalProps) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addApplication = useApplicationStore((state) => state.addApplication);

  const handleSubmit = async () => {
    if (!resumeId) {
      toast.error('No resume selected');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await applicationService.create({
        jobId: job._id,
        resumeId,
        coverLetter: coverLetter.trim() || undefined,
        submissionMethod: 'manual'
      });

      addApplication(response.data);
      toast.success('Application submitted successfully!');
      onOpenChange(false);
      setCoverLetter('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Apply error:', error);
      toast.error(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Apply to Position</DialogTitle>
          <DialogDescription>
            Review the job details and optionally add a cover letter
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Job Details */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/50 border">
            <div>
              <h3 className="text-xl font-semibold">{job.title}</h3>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Building2 className="h-4 w-4" />
                <span>{job.company}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>

              {job.salary && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>{job.salary}</span>
                </div>
              )}

              {job.employmentType && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span className="capitalize">{job.employmentType.replace('-', ' ')}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {job.source}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {job.description}
              </p>
            </div>

            <div>
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                View full job posting
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter" className="text-base font-semibold">
              Cover Letter (Optional)
            </Label>
            <p className="text-sm text-muted-foreground">
              Add a personalized message to stand out from other applicants
            </p>
            <textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my interest in the position..."
              className="w-full min-h-[200px] p-3 rounded-md border bg-background resize-y"
              maxLength={2000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {coverLetter.length} / 2000 characters
            </div>
          </div>

          {/* Info Note */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Your application will be tracked in CV-Express. 
              You'll need to visit the company's website to complete the formal application process.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyModal;


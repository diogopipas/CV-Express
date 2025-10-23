import { useState } from 'react';
import { Upload, FileText, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { resumeService } from '../services/api';
import { useResumeStore } from '../store/useResumeStore';
import { useAuthStore } from '../store/useAuthStore';
import { useLoadingStore } from '../store/useLoadingStore';
import SubscriptionPlansDialog from './SubscriptionPlansDialog';

interface UploadResumeDialogProps {
  children?: React.ReactNode;
}

const UploadResumeDialog = ({ children }: UploadResumeDialogProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { resumes } = useResumeStore();
  const [open, setOpen] = useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { addResume } = useResumeStore();
  const { setLoading } = useLoadingStore();

  const handleOpenDialog = () => {
    if (!isAuthenticated) {
      toast.error('Please login to upload your resume');
      navigate('/login');
      return;
    }
    
    // Check if user has reached the 5 CV limit
    if (resumes.length >= 5) {
      // Show subscription plans to upgrade or prompt to delete
      setShowSubscriptionPlans(true);
    } else {
      // User has less than 5 CVs, proceed directly to upload
      setOpen(true);
    }
  };

  const handlePlanSelected = (plan: 'free' | 'pro' | 'enterprise') => {
    setShowSubscriptionPlans(false);
    
    if (plan === 'free') {
      toast.info('Free plan - Please delete a CV to upload a new one', {
        description: 'Free plan allows up to 5 CVs'
      });
    } else {
      toast.success(`${plan.charAt(0).toUpperCase() + plan.slice(1)} plan selected!`, {
        description: 'Enjoy unlimited CVs and features'
      });
      // Open the upload dialog after upgrading to paid plan
      setOpen(true);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, Word document, or text file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    try {
      // Show global loading overlay
      setLoading(true, 'Uploading Resume...', 'Analyzing your resume and extracting skills');
      
      // Step 1: Upload the resume
      const response = await resumeService.upload(file);
      const resume = response.data;
      addResume(resume);
      
      toast.success('Resume uploaded successfully!', {
        description: 'Use the search bar to find matching jobs'
      });
      
      setOpen(false);
      setFile(null);
      
      // Hide loading overlay
      setLoading(false);
      
      // Navigate to jobs page with the new resume selected
      navigate('/jobs', { 
        state: { 
          newResumeId: resume._id
        } 
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload resume');
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <>
      {children ? (
        <div onClick={handleOpenDialog}>
          {children}
        </div>
      ) : (
        <Button 
          onClick={handleOpenDialog}
          className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-lg shadow-teal-500/30 group"
        >
          <Upload className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
          Upload Resume
          <Sparkles className="ml-2 h-3.5 w-3.5 animate-pulse" />
        </Button>
      )}
      
      {/* Subscription Plans Dialog */}
      <SubscriptionPlansDialog
        open={showSubscriptionPlans}
        onOpenChange={setShowSubscriptionPlans}
        onPlanSelected={handlePlanSelected}
        title="CV Limit Reached"
        description="You've reached the 5 CV limit on the Free plan. Upgrade to Pro for unlimited CVs or delete an existing CV."
      />

      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg border-border/50 bg-gradient-to-b from-background to-muted/20">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-500/30">
              <Upload className="h-5 w-5 text-teal-400" />
            </div>
            <DialogTitle className="text-2xl">Upload Your Resume</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Upload your CV in PDF, Word, or text format. Our AI will analyze your skills and suggest the perfect job matches.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {!file ? (
            <div
              className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-teal-500 bg-teal-500/10 scale-[1.02]'
                  : 'border-border/50 hover:border-teal-500/50 hover:bg-teal-500/5'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_70%)]"></div>
              <div className="relative flex flex-col items-center space-y-5">
                <div className="relative">
                  {dragActive && (
                    <div className="absolute inset-0 rounded-full bg-teal-500/30 animate-ping"></div>
                  )}
                  <div className="relative rounded-2xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 p-6 border border-teal-500/30">
                    <Upload className={`h-10 w-10 text-teal-400 ${dragActive ? 'animate-bounce' : ''}`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-base font-semibold">
                    Drag and drop your resume here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click below to browse your files
                  </p>
                  <div className="flex items-center gap-2 justify-center pt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />
                      PDF
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />
                      DOC/DOCX
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />
                      TXT
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />
                      Max 10MB
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="border-teal-500/30 hover:border-teal-500 hover:bg-teal-500/10 group"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <FileText className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  Browse Files
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden border rounded-2xl bg-gradient-to-br from-teal-500/10 to-blue-500/10 border-teal-500/30 p-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl"></div>
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="rounded-xl bg-teal-500/20 p-3 border border-teal-500/30">
                    <FileText className="h-6 w-6 text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-semibold truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-xs text-emerald-400 font-medium">Ready to upload</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                  className="text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file}
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-lg shadow-teal-500/30 px-6 group"
            >
              <Upload className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              Upload Resume
              <Sparkles className="ml-2 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default UploadResumeDialog;


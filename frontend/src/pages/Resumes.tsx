import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
  FileText, 
  Trash2, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target,
  Zap,
  Briefcase,
  Sparkles,
  Rocket,
  Activity,
  Award,
  BarChart3
} from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore';
import { resumeService } from '../services/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import UploadResumeDialog from '../components/UploadResumeDialog';

const Resumes = () => {
  const { resumes, latestResume, setResumes, setLatestResume, removeResume } = useResumeStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const [resumesResponse, latestResponse] = await Promise.allSettled([
        resumeService.getResumes(),
        resumeService.getLatestResume(),
      ]);

      if (resumesResponse.status === 'fulfilled') {
        setResumes(resumesResponse.value.data);
      }
      if (latestResponse.status === 'fulfilled') {
        setLatestResume(latestResponse.value.data);
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      await resumeService.deleteResume(id);
      removeResume(id);
      toast.success('Resume deleted successfully');
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 animate-spin"></div>
              <div className="absolute inset-1 rounded-full bg-background"></div>
              <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-teal-500 animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground animate-pulse">Preparing your resume dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500/10 via-blue-500/10 to-purple-500/10 border border-teal-500/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_70%)]"></div>
        <div className="relative p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                AI-Powered Job Automation
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Search Jobs
                </span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Transform your job search with intelligent resume analysis and automated applications
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={loadResumes}
                className="group border-teal-500/30 hover:border-teal-500/50 hover:bg-teal-500/10"
              >
                <Activity className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                Refresh
              </Button>
              <UploadResumeDialog />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      {latestResume && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Application Analytics</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Applications */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-6 hover:border-blue-500/40 transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                    <Rocket className="h-5 w-5 text-blue-400" />
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40 text-xs">
                    Total
                  </Badge>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400">{latestResume.appliedJobs}</div>
                  <div className="text-sm text-muted-foreground mt-1">Applications Sent</div>
                </div>
              </div>
            </div>

            {/* Successful */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 p-6 hover:border-emerald-500/40 transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs">
                    Success
                  </Badge>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-400">{latestResume.successfulApplications}</div>
                  <div className="text-sm text-muted-foreground mt-1">Delivered Successfully</div>
                </div>
              </div>
            </div>

            {/* Failed */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500/10 to-rose-600/5 border border-rose-500/20 p-6 hover:border-rose-500/40 transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-rose-500/20 group-hover:bg-rose-500/30 transition-colors">
                    <XCircle className="h-5 w-5 text-rose-400" />
                  </div>
                  <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/40 text-xs">
                    Failed
                  </Badge>
                </div>
                <div>
                  <div className="text-3xl font-bold text-rose-400">{latestResume.failedApplications}</div>
                  <div className="text-sm text-muted-foreground mt-1">Need Attention</div>
                </div>
              </div>
            </div>

            {/* In Queue */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-6 hover:border-amber-500/40 transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-amber-500/20 group-hover:bg-amber-500/30 transition-colors">
                    <Clock className="h-5 w-5 text-amber-400" />
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-xs">
                    Pending
                  </Badge>
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-400">{latestResume.inQueue}</div>
                  <div className="text-sm text-muted-foreground mt-1">Queued & Processing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume Collection */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Your Resumes</h2>
            <p className="text-sm text-muted-foreground">
              {resumes.length} resume{resumes.length !== 1 ? 's' : ''} in your collection
            </p>
          </div>
        </div>

        {resumes.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-muted-foreground/30 bg-gradient-to-br from-muted/30 to-muted/10 p-16">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]"></div>
            <div className="relative flex flex-col items-center space-y-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-teal-500/20"></div>
                <div className="relative rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 p-8 border border-teal-500/30">
                  <FileText className="h-12 w-12 text-teal-400" />
                </div>
              </div>
              <div className="space-y-3 max-w-md">
                <h3 className="text-xl font-semibold">Start Your Journey</h3>
                <p className="text-muted-foreground">
                  Upload your first resume to unlock AI-powered job matching, skill extraction, and automated applications.
                </p>
              </div>
              <UploadResumeDialog />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {resumes.map((resume, index) => (
              <div 
                key={resume._id} 
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-teal-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/5"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/30 to-blue-500/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative rounded-xl bg-gradient-to-br from-teal-500/10 to-blue-500/10 p-3 border border-teal-500/20">
                          <FileText className="h-7 w-7 text-teal-400" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{resume.originalName}</h3>
                            {resume.isLatest && (
                              <Badge className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/40">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            )}
                            <Badge variant="outline" className="capitalize border-teal-500/30 text-teal-400">
                              {resume.plan}
                            </Badge>
                          </div>

                          {/* Meta Info */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatDate(resume.uploadDate)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5" />
                              <span>{formatFileSize(resume.fileSize)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Award className="h-3.5 w-3.5" />
                              <span className="capitalize">{resume.status}</span>
                            </div>
                          </div>
                        </div>

                        {resume.status === 'completed' && (
                          <>
                            {/* Searched Titles */}
                            {resume.searchedTitles.length > 0 && (
                              <div className="space-y-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="p-1 rounded bg-blue-500/20">
                                    <Target className="h-3.5 w-3.5 text-blue-400" />
                                  </div>
                                  <span className="text-sm font-medium">Targeted Roles</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {resume.searchedTitles.map((title, index) => (
                                    <Badge 
                                      key={index} 
                                      className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/40 hover:border-blue-500/60 transition-all"
                                    >
                                      {title}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Suggested Roles */}
                            {resume.suggestedRoles.length > 0 && (
                              <div className="space-y-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="p-1 rounded bg-purple-500/20">
                                    <Briefcase className="h-3.5 w-3.5 text-purple-400" />
                                  </div>
                                  <span className="text-sm font-medium">AI Suggestions</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Roles that match your profile
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {resume.suggestedRoles.slice(0, 8).map((role, index) => (
                                    <Badge 
                                      key={index} 
                                      variant="outline"
                                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-all"
                                    >
                                      {role}
                                    </Badge>
                                  ))}
                                  {resume.suggestedRoles.length > 8 && (
                                    <Badge variant="outline" className="opacity-60">
                                      +{resume.suggestedRoles.length - 8} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Skills */}
                            {resume.extractedSkills.length > 0 && (
                              <div className="space-y-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="p-1 rounded bg-teal-500/20">
                                    <Zap className="h-3.5 w-3.5 text-teal-400" />
                                  </div>
                                  <span className="text-sm font-medium">Extracted Skills</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {resume.extractedSkills.slice(0, 12).map((skill, index) => (
                                    <Badge 
                                      key={index} 
                                      variant="secondary"
                                      className="text-xs bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                  {resume.extractedSkills.length > 12 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{resume.extractedSkills.length - 12}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Job Stats Grid */}
                            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50">
                              <div className="text-center space-y-1">
                                <div className="text-xl font-bold text-teal-400">{resume.totalJobs}</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Jobs</div>
                              </div>
                              <div className="text-center space-y-1 border-x border-border/50">
                                <div className="text-xl font-bold text-emerald-400">{resume.newJobs}</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">New</div>
                              </div>
                              <div className="text-center space-y-1">
                                <div className="text-xl font-bold text-blue-400">
                                  {resume.jobSearchesUsed}/{resume.jobSearchesLimit}
                                </div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Searches</div>
                              </div>
                            </div>


                            {/* Usage Tracking */}
                            <div className="rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 p-4 space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Activity className="h-4 w-4 text-orange-400" />
                                  <span className="font-medium">Usage Metrics</span>
                                </div>
                                <Badge variant="outline" className="border-orange-500/40 text-orange-400 text-xs">
                                  {resume.plan}
                                </Badge>
                              </div>
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Resume Applications</span>
                                  <span className="font-medium">{resume.resumeUsageCount}/{resume.resumeUsageLimit}</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
                                    style={{ width: `${(resume.resumeUsageCount / resume.resumeUsageLimit) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            {/* Upgrade CTA */}
                            {resume.plan === 'FREE' && (
                              <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/30 p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <Rocket className="h-4 w-4 text-amber-400" />
                                      <span className="font-semibold text-sm">Unlock Pro Features</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      Unlimited searches, 10 resumes, priority support
                                    </p>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20"
                                  >
                                    Upgrade
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(resume._id)}
                      className="text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resumes;


import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  FileText, 
  Trash2, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target,
  TrendingUp,
  Zap,
  Search,
  Briefcase
} from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore';
import { resumeService } from '../services/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import UploadResumeDialog from '../components/UploadResumeDialog';

const Resumes = () => {
  const navigate = useNavigate();
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
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading resumes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Auto Job Apply
          </h1>
          <p className="text-muted-foreground mt-1">
            Automate job searching and applying processes with LockedIn AI
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={loadResumes}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <UploadResumeDialog />
        </div>
      </div>

      {/* Overall Application Progress */}
      {latestResume && (
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/30 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="rounded-lg bg-purple-500/20 p-2">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold">Overall Application Progress</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-purple-900/40 border-purple-700/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold">{latestResume.appliedJobs}</div>
              <div className="text-sm text-muted-foreground">Total Applications</div>
            </Card>

            <Card className="bg-green-900/40 border-green-700/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold">{latestResume.successfulApplications}</div>
              <div className="text-sm text-muted-foreground">Successfully Applied</div>
            </Card>

            <Card className="bg-red-900/40 border-red-700/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="text-3xl font-bold">{latestResume.failedApplications}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </Card>

            <Card className="bg-yellow-900/40 border-yellow-700/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold">{latestResume.inQueue}</div>
              <div className="text-sm text-muted-foreground">In Queue</div>
            </Card>
          </div>
        </Card>
      )}

      {/* Your Resumes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Resumes</h2>
          <div className="text-sm text-muted-foreground">
            {resumes.length} resume{resumes.length !== 1 ? 's' : ''} uploaded
          </div>
        </div>

        {resumes.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-muted p-6">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No resumes uploaded yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Upload your resume to get started with AI-powered job search and skill extraction.
                </p>
              </div>
              <UploadResumeDialog />
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <Card key={resume._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">{resume.originalName}</h3>
                        {resume.isLatest && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/40">
                            Latest
                          </Badge>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {resume.plan}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Uploaded {formatDate(resume.uploadDate)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>{formatFileSize(resume.fileSize)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4" />
                          <span className="capitalize">{resume.status}</span>
                        </div>
                      </div>

                      {resume.status === 'completed' && (
                        <>
                          {/* Searched Titles */}
                          {resume.searchedTitles.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm">
                                <Search className="h-4 w-4 text-cyan-400" />
                                <span className="font-medium">Searched Titles:</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {resume.searchedTitles.map((title, index) => (
                                  <Badge key={index} className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40">
                                    {title}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Other Suggested Roles */}
                          {resume.suggestedRoles.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm">
                                <Briefcase className="h-4 w-4 text-amber-400" />
                                <span className="font-medium">Other Suggested Roles:</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                AI-generated suggestions based on your resume content
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {resume.suggestedRoles.map((role, index) => (
                                  <Badge key={index} variant="outline">
                                    {role}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Skills */}
                          {resume.extractedSkills.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-sm font-medium">Skills:</div>
                              <div className="flex flex-wrap gap-2">
                                {resume.extractedSkills.map((skill, index) => (
                                  <Badge key={index} variant="secondary">
                                    {skill}
                                  </Badge>
                                ))}
                                {resume.extractedSkills.length > 12 && (
                                  <Badge variant="outline">+{resume.extractedSkills.length - 12} more</Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Job Stats */}
                          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                            <div className="space-y-1">
                              <div className="text-2xl font-bold text-cyan-400">{resume.totalJobs}</div>
                              <div className="text-xs text-muted-foreground">Total Jobs</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-2xl font-bold text-green-400">{resume.newJobs}</div>
                              <div className="text-xs text-muted-foreground">New Jobs</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xl font-bold text-red-400">
                                {resume.jobSearchesUsed}/{resume.jobSearchesLimit}
                              </div>
                              <div className="text-xs text-muted-foreground">Job Searches Used</div>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          {resume.totalJobs > 0 && (
                            <div className="pt-4 border-t">
                              <Button 
                                onClick={() => navigate('/')} 
                                className="w-full bg-cyan-500 hover:bg-cyan-600"
                              >
                                <Search className="mr-2 h-4 w-4" />
                                View Jobs
                              </Button>
                            </div>
                          )}

                          {/* Usage Stats */}
                          <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2 text-sm">
                                <FileText className="h-4 w-4 text-amber-400" />
                                <span className="font-medium">Resume Usage</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {resume.resumeUsageCount}/{resume.resumeUsageLimit} used ({resume.plan})
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Search className="h-4 w-4 text-cyan-400" />
                              <span className="font-medium">Job Search Limit</span>
                              <span className="text-sm text-muted-foreground ml-auto">
                                {resume.jobSearchesLimit} per resume ({resume.plan})
                              </span>
                            </div>
                          </div>

                          {/* Upgrade CTA */}
                          {resume.plan === 'FREE' && (
                            <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 border border-amber-700/40 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <Zap className="h-4 w-4 text-amber-400" />
                                    <span className="font-semibold">Upgrade to Pro</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Get unlimited job searches and up to 10 resumes. No more limits!
                                  </p>
                                </div>
                                <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                                  Upgrade Now
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(resume._id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resumes;


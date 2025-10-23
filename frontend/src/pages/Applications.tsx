import { useEffect, useState } from 'react';
import { 
  Inbox, 
  Search,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
  TrendingUp,
  ListChecks,
  Mail,
  MailOpen,
  Calendar,
  ThumbsDown,
  Gift,
  MessageSquare,
  ClipboardList,
  PlayCircle,
  Trash2,
  Building2,
  MapPin,
  Star
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { applicationService, ApplicationStats } from '../services/api';
import { useApplicationStore } from '../store/useApplicationStore';
import { toast } from 'sonner';
import ApplicationDetail from '../components/ApplicationDetail';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface QueueItem {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    salary?: string;
  };
  matchScore: number;
  matchReasons: Array<{
    category: string;
    score: number;
    details: string;
  }>;
  status: string;
  queuedAt: string;
}

interface Email {
  _id: string;
  from: string;
  subject: string;
  body: string;
  htmlBody?: string;
  receivedAt: string;
  isRead: boolean;
  category: 'general' | 'interview' | 'rejection' | 'offer' | 'followup' | 'assessment';
  applicationId?: {
    _id: string;
    jobId: {
      title: string;
      company: string;
    };
  };
}

const statusOptions = [
  { value: 'all', label: 'All Applications', icon: Inbox },
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'applied', label: 'Applied', icon: CheckCircle },
  { value: 'interviewing', label: 'Interviewing', icon: Briefcase },
  { value: 'offered', label: 'Offered', icon: TrendingUp },
  { value: 'rejected', label: 'Rejected', icon: XCircle },
  { value: 'accepted', label: 'Accepted', icon: CheckCircle },
  { value: 'withdrawn', label: 'Withdrawn', icon: AlertCircle },
];

const categoryIcons = {
  general: MessageSquare,
  interview: Calendar,
  rejection: ThumbsDown,
  offer: Gift,
  followup: Mail,
  assessment: ClipboardList
};

const categoryColors = {
  general: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  interview: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  rejection: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  offer: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  followup: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  assessment: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
};

const getStatusColor = (_status: string) => {
  // Minimalistic neutral styling for all statuses
  return 'bg-muted/50 text-muted-foreground border border-border';
};

const Applications = () => {
  const [activeTab, setActiveTab] = useState<'applications' | 'queue' | 'inbox'>('applications');
  const {
    applications,
    selectedApplication,
    isLoading,
    filters,
    setApplications,
    setSelectedApplication,
    setLoading,
    setFilters,
  } = useApplicationStore();

  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Queue state
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [queueStats, setQueueStats] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [processing, setProcessing] = useState(false);

  // Inbox state
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailStats, setEmailStats] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isReadFilter, setIsReadFilter] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications();
      fetchStats();
    } else if (activeTab === 'queue') {
      fetchQueue();
    } else if (activeTab === 'inbox') {
      fetchEmails();
      fetchEmailStats();
    }
  }, [filters, activeTab, statusFilter, categoryFilter, isReadFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await applicationService.getApplications({
        status: filters.status === 'all' ? undefined : filters.status,
        priority: filters.priority,
        search: filters.search,
      });
      setApplications(response.data);
    } catch (error) {
      console.error('Fetch applications error:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await applicationService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleSearch = () => {
    setFilters({ search: searchTerm });
  };

  const handleStatusFilter = (status: string) => {
    setFilters({ status });
    setSelectedApplication(null);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Queue functions
  const fetchQueue = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/applications/queue`, {
        params: { status: statusFilter },
        headers: { Authorization: `Bearer ${token}` }
      });
      setQueueItems(response.data.data);
      setQueueStats(response.data.stats);
    } catch (error: any) {
      console.error('Fetch queue error:', error);
      toast.error('Failed to fetch queue');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/applications/queue/${id}/review`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Job ${action}d successfully`);
      fetchQueue();
    } catch (error: any) {
      toast.error(`Failed to ${action} job`);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) {
      toast.error('No jobs selected');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/applications/queue/bulk-approve`,
        { queueIds: Array.from(selectedIds) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${selectedIds.size} jobs approved`);
      setSelectedIds(new Set());
      fetchQueue();
    } catch (error: any) {
      toast.error('Failed to bulk approve');
    }
  };

  const handleProcessQueue = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/applications/queue/process`,
        { batchSize: 10 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      fetchQueue();
    } catch (error: any) {
      toast.error('Failed to process queue');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteQueue = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/applications/queue/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Removed from queue');
      fetchQueue();
    } catch (error: any) {
      toast.error('Failed to remove from queue');
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  // Inbox functions
  const fetchEmails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params: any = {};
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (isReadFilter !== undefined) params.isRead = isReadFilter;

      const response = await axios.get(`${API_URL}/emails`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmails(response.data.data);
    } catch (error: any) {
      console.error('Fetch emails error:', error);
      toast.error('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/emails/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmailStats(response.data.data);
    } catch (error: any) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleSelectEmail = async (email: Email) => {
    setSelectedEmail(email);

    if (!email.isRead) {
      try {
        const token = localStorage.getItem('token');
        await axios.patch(
          `${API_URL}/emails/${email._id}/read`,
          { isRead: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchEmails();
        fetchEmailStats();
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    }
  };

  const handleToggleRead = async (email: Email) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/emails/${email._id}/read`,
        { isRead: !email.isRead },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Marked as ${!email.isRead ? 'read' : 'unread'}`);
      fetchEmails();
      fetchEmailStats();
    } catch (error: any) {
      toast.error('Failed to update email');
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/emails/${emailId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Email deleted');
      setSelectedEmail(null);
      fetchEmails();
      fetchEmailStats();
    } catch (error: any) {
      toast.error('Failed to delete email');
    }
  };

  const formatEmailDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Applications</h1>
        <p className="text-muted-foreground mb-4">
          {activeTab === 'applications' && 'Manage and track your job applications'}
          {activeTab === 'queue' && 'Review and approve matched jobs'}
          {activeTab === 'inbox' && 'Emails sent to your dedicated application address'}
        </p>
        
        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'applications'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Inbox className="h-4 w-4" />
            Applications
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'queue'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ListChecks className="h-4 w-4" />
            Queue
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'inbox'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mail className="h-4 w-4" />
            Inbox
            {emailStats?.unread > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {emailStats.unread}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-500/10">
                    <BarChart3 className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Interviews</p>
                    <p className="text-2xl font-bold">{stats.interviewing}</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-500/10">
                    <Briefcase className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Offers</p>
                    <p className="text-2xl font-bold">{stats.offered}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-500/10">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{stats.successRate}%</p>
                  </div>
                  <div className="p-3 rounded-full bg-teal-500/10">
                    <CheckCircle className="h-6 w-6 text-teal-500" />
                  </div>
                </div>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar with filters and list */}
            <div className="lg:col-span-1 space-y-4">
              {/* Search */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-9"
                  />
                </div>
                <Button onClick={handleSearch} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Status Filters */}
              <Card className="p-2">
                <div className="space-y-1">
                  {statusOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = filters.status === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleStatusFilter(option.value)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{option.label}</span>
                        {option.value !== 'all' && stats && (
                          <span className="text-xs">
                            {stats[option.value as keyof ApplicationStats] || 0}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Applications List */}
              <Card className="p-2 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8">
                    <Inbox className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">No applications found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {applications.map((app) => (
                      <button
                        key={app._id}
                        onClick={() => setSelectedApplication(app)}
                        className={`w-full text-left p-3 rounded-md transition-colors ${
                          selectedApplication?._id === app._id
                            ? 'bg-primary/10 border-2 border-primary'
                            : 'hover:bg-muted border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {app.jobId.title}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {app.jobId.company}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${getStatusColor(
                              app.status
                            )}`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(app.appliedDate)}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Detail View */}
            <div className="lg:col-span-2">
              {selectedApplication ? (
                <ApplicationDetail
                  application={selectedApplication}
                  onUpdate={fetchApplications}
                />
              ) : (
                <Card className="p-12 text-center">
                  <Inbox className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Application Selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Select an application from the list to view details
                  </p>
                </Card>
              )}
            </div>
          </div>
        </>
      )}

      {/* Queue Tab */}
      {activeTab === 'queue' && (
        <>
          {/* Queue Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {selectedIds.size > 0 && (
                <Button onClick={handleBulkApprove}>
                  Approve Selected ({selectedIds.size})
                </Button>
              )}
              {queueStats?.approved > 0 && (
                <Button onClick={handleProcessQueue} disabled={processing}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {processing ? 'Processing...' : `Process ${queueStats.approved} Approved`}
                </Button>
              )}
            </div>
          </div>

          {/* Queue Stats */}
          {queueStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(queueStats).map(([key, value]: any) => (
                <Card key={key} className="p-4">
                  <p className="text-sm text-muted-foreground capitalize">{key.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Queue Filters */}
          <Card className="p-4">
            <div className="flex gap-2">
              {['pending_review', 'approved', 'rejected', 'completed', 'failed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm capitalize ${
                    statusFilter === status
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </Card>

          {/* Queue Items */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            </div>
          ) : queueItems.length === 0 ? (
            <Card className="p-12 text-center">
              <Clock className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Jobs in Queue</h3>
              <p className="text-sm text-muted-foreground">
                {statusFilter === 'pending_review'
                  ? 'Add jobs to your queue from the Jobs page'
                  : `No jobs with status: ${statusFilter}`}
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {queueItems.map((item) => (
                <Card key={item._id} className="p-6">
                  <div className="flex gap-4">
                    {statusFilter === 'pending_review' && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item._id)}
                          onChange={() => toggleSelection(item._id)}
                          className="w-5 h-5 cursor-pointer"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      {/* Job Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold">{item.jobId.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {item.jobId.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {item.jobId.location}
                            </span>
                            {item.jobId.salary && <span>{item.jobId.salary}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getMatchColor(item.matchScore)}`}>
                            {item.matchScore}%
                          </div>
                          <div className="text-xs text-muted-foreground">Match Score</div>
                        </div>
                      </div>

                      {/* Match Reasons */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        {item.matchReasons.map((reason, idx) => (
                          <div key={idx} className="bg-muted rounded-lg p-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium capitalize">{reason.category}</span>
                              <span className="text-xs font-bold">{reason.score}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{reason.details}</p>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      {statusFilter === 'pending_review' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReview(item._id, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(item._id, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteQueue(item._id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Inbox Tab */}
      {activeTab === 'inbox' && (
        <>
          {/* Email Stats */}
          {emailStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{emailStats.total}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-blue-600">{emailStats.unread}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Interviews</p>
                <p className="text-2xl font-bold text-purple-600">{emailStats.interviews}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Offers</p>
                <p className="text-2xl font-bold text-green-600">{emailStats.offers}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Rejections</p>
                <p className="text-2xl font-bold text-red-600">{emailStats.rejections}</p>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Email List */}
            <div className="lg:col-span-1 space-y-4">
              {/* Filters */}
              <Card className="p-2">
                <div className="flex gap-1 mb-2 flex-wrap">
                  {['all', 'interview', 'offer', 'rejection', 'assessment', 'followup', 'general'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2 py-1 rounded text-xs capitalize ${
                        categoryFilter === cat
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setIsReadFilter(undefined)}
                    className={`px-2 py-1 rounded text-xs ${
                      isReadFilter === undefined ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setIsReadFilter(false)}
                    className={`px-2 py-1 rounded text-xs ${
                      isReadFilter === false ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    Unread
                  </button>
                  <button
                    onClick={() => setIsReadFilter(true)}
                    className={`px-2 py-1 rounded text-xs ${
                      isReadFilter === true ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    Read
                  </button>
                </div>
              </Card>

              {/* Email List */}
              <Card className="p-2 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  </div>
                ) : emails.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">No emails found</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {emails.map((email) => {
                      const Icon = categoryIcons[email.category];
                      return (
                        <button
                          key={email._id}
                          onClick={() => handleSelectEmail(email)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedEmail?._id === email._id
                              ? 'bg-primary/10 border-2 border-primary'
                              : 'hover:bg-muted border-2 border-transparent'
                          } ${!email.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                        >
                          <div className="flex items-start gap-2">
                            <Icon className="w-4 h-4 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[email.category]}`}>
                                  {email.category}
                                </span>
                                {!email.isRead && (
                                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                )}
                              </div>
                              <p className={`text-sm truncate ${!email.isRead ? 'font-semibold' : ''}`}>
                                {email.subject}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {email.from}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatEmailDate(email.receivedAt)}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>

            {/* Email Detail */}
            <div className="lg:col-span-2">
              {selectedEmail ? (
                <Card className="p-6">
                  <div className="mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">{selectedEmail.subject}</h2>
                        <p className="text-sm text-muted-foreground">From: {selectedEmail.from}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedEmail.receivedAt).toLocaleString()}
                        </p>
                        {selectedEmail.applicationId && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Related to: {selectedEmail.applicationId.jobId.title} at{' '}
                            {selectedEmail.applicationId.jobId.company}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleRead(selectedEmail)}
                        >
                          {selectedEmail.isRead ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteEmail(selectedEmail._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      {selectedEmail.htmlBody ? (
                        <div
                          className="prose dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }}
                        />
                      ) : (
                        <div className="whitespace-pre-wrap text-sm">{selectedEmail.body}</div>
                      )}
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-12 text-center h-full flex items-center justify-center">
                  <div>
                    <Mail className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Email Selected</h3>
                    <p className="text-sm text-muted-foreground">
                      Select an email from the list to view its contents
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Applications;


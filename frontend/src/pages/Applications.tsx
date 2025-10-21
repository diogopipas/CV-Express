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
  TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { applicationService, ApplicationStats } from '../services/api';
import { useApplicationStore } from '../store/useApplicationStore';
import { toast } from 'sonner';
import ApplicationDetail from '../components/ApplicationDetail';

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

const getStatusColor = (_status: string) => {
  // Minimalistic neutral styling for all statuses
  return 'bg-muted/50 text-muted-foreground border border-border';
};

const Applications = () => {
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

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [filters]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground">Manage and track your job applications</p>
        </div>
      </div>

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
    </div>
  );
};

export default Applications;


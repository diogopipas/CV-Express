import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Building2,
  Star,
  PlayCircle,
  Trash2,
} from 'lucide-react';
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

export default function Queue() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/applications/queue`, {
        params: { status: statusFilter },
        headers: { Authorization: `Bearer ${token}` }
      });
      setQueueItems(response.data.data);
      setStats(response.data.stats);
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

  const handleDelete = async (id: string) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Application Queue</h1>
          <p className="text-muted-foreground">Review and approve matched jobs</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button onClick={handleBulkApprove}>
              Approve Selected ({selectedIds.size})
            </Button>
          )}
          {stats?.approved > 0 && (
            <Button onClick={handleProcessQueue} disabled={processing}>
              <PlayCircle className="w-4 h-4 mr-2" />
              {processing ? 'Processing...' : `Process ${stats.approved} Approved`}
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(stats).map(([key, value]: any) => (
            <Card key={key} className="p-4">
              <p className="text-sm text-muted-foreground capitalize">{key.replace('_', ' ')}</p>
              <p className="text-2xl font-bold">{value}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
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
      {loading ? (
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
                        onClick={() => handleDelete(item._id)}
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
    </div>
  );
}


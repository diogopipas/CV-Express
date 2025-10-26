import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Mail, 
  MailOpen, 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar, 
  MapPin, 
  DollarSign,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Email {
  _id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  htmlBody?: string;
  receivedAt: string;
  isRead: boolean;
  category: 'general' | 'interview' | 'rejection' | 'offer' | 'followup' | 'assessment';
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
    url?: string;
  }>;
  metadata?: {
    interviewDate?: Date;
    interviewLocation?: string;
    interviewType?: 'phone' | 'video' | 'onsite';
    salaryOffer?: string;
    assessmentDeadline?: Date;
    [key: string]: any;
  };
  applicationId?: {
    _id: string;
    jobId: {
      title: string;
      company: string;
    };
    status: string;
  };
}

interface EmailStats {
  total: number;
  unread: number;
  interviews: number;
  offers: number;
  rejections: number;
}

const categoryColors = {
  interview: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  offer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  rejection: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  assessment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  followup: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

const categoryIcons = {
  interview: Calendar,
  offer: CheckCircle,
  rejection: XCircle,
  assessment: Clock,
  followup: AlertCircle,
  general: Mail
};

export default function Inbox() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState<EmailStats>({
    total: 0,
    unread: 0,
    interviews: 0,
    offers: 0,
    rejections: 0
  });
  const [filters, setFilters] = useState({
    category: 'all',
    isRead: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchEmails();
    fetchStats();
  }, [filters, pagination.page]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.isRead !== 'all' && { isRead: filters.isRead }),
        ...(filters.search && { search: filters.search })
      });

      const response = await axios.get(`${API_URL}/emails?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEmails(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      }));
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/emails/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleEmailClick = async (email: Email) => {
    setSelectedEmail(email);
    
    // Mark as read if not already
    if (!email.isRead) {
      try {
        const token = localStorage.getItem('token');
        await axios.patch(`${API_URL}/emails/${email._id}/read`, 
          { isRead: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Update local state
        setEmails(prev => prev.map(e => 
          e._id === email._id ? { ...e, isRead: true } : e
        ));
        
        // Update stats
        setStats(prev => ({ ...prev, unread: prev.unread - 1 }));
      } catch (error) {
        console.error('Error marking email as read:', error);
      }
    }
  };

  const handleSyncEmails = async () => {
    try {
      setSyncing(true);
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/email-oauth/sync`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh emails after sync
      await fetchEmails();
      await fetchStats();
    } catch (error) {
      console.error('Error syncing emails:', error);
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getCategoryIcon = (category: string) => {
    const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Mail;
    return <IconComponent className="w-4 h-4" />;
  };

  const renderEmailPreview = (email: Email) => {
    const bodyPreview = email.body.substring(0, 150) + (email.body.length > 150 ? '...' : '');
    
    return (
      <Card 
        key={email._id}
        className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
          !email.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
        }`}
        onClick={() => handleEmailClick(email)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge className={categoryColors[email.category]}>
              {getCategoryIcon(email.category)}
              <span className="ml-1 capitalize">{email.category}</span>
            </Badge>
            {!email.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDate(email.receivedAt)}
          </span>
        </div>
        
        <h3 className="font-semibold mb-1">{email.subject}</h3>
        <p className="text-sm text-muted-foreground mb-2">{email.from}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {bodyPreview}
        </p>
        
        {email.applicationId && (
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
            <span className="font-medium">Linked to:</span> {email.applicationId.jobId.title} at {email.applicationId.jobId.company}
          </div>
        )}
      </Card>
    );
  };

  const renderEmailDetail = (email: Email) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{email.subject}</h2>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-1" />
            Open in Email
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span><strong>From:</strong> {email.from}</span>
          <span><strong>To:</strong> {email.to}</span>
          <span><strong>Date:</strong> {new Date(email.receivedAt).toLocaleString()}</span>
        </div>
        
        <Badge className={categoryColors[email.category]}>
          {getCategoryIcon(email.category)}
          <span className="ml-1 capitalize">{email.category}</span>
        </Badge>
        
        {email.metadata && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold mb-2">Extracted Information</h4>
            <div className="space-y-2">
              {email.metadata.interviewDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Interview Date: {new Date(email.metadata.interviewDate).toLocaleDateString()}</span>
                </div>
              )}
              {email.metadata.interviewLocation && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Location: {email.metadata.interviewLocation}</span>
                </div>
              )}
              {email.metadata.salaryOffer && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Salary: {email.metadata.salaryOffer}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="prose dark:prose-invert max-w-none">
          {email.htmlBody ? (
            <div dangerouslySetInnerHTML={{ __html: email.htmlBody }} />
          ) : (
            <pre className="whitespace-pre-wrap font-sans">{email.body}</pre>
          )}
        </div>
        
        {email.attachments.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Attachments</h4>
            <div className="space-y-2">
              {email.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <span>{attachment.filename}</span>
                  <span className="text-sm text-muted-foreground">
                    ({(attachment.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Email Inbox</h1>
            <p className="text-muted-foreground">Application-related emails from your connected inbox</p>
          </div>
          <Button onClick={handleSyncEmails} disabled={syncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Emails'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
            <div className="text-sm text-muted-foreground">Unread</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.interviews}</div>
            <div className="text-sm text-muted-foreground">Interviews</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.offers}</div>
            <div className="text-sm text-muted-foreground">Offers</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejections}</div>
            <div className="text-sm text-muted-foreground">Rejections</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email List */}
          <div className="lg:col-span-1">
            {/* Filters */}
            <Card className="p-4 mb-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search emails..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="interview">Interviews</SelectItem>
                      <SelectItem value="offer">Offers</SelectItem>
                      <SelectItem value="rejection">Rejections</SelectItem>
                      <SelectItem value="assessment">Assessments</SelectItem>
                      <SelectItem value="followup">Follow-ups</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={filters.isRead}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, isRead: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="false">Unread</SelectItem>
                      <SelectItem value="true">Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Email List */}
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8">Loading emails...</div>
              ) : emails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No emails found
                </div>
              ) : (
                emails.map(renderEmailPreview)
              )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Email Detail */}
          <div className="lg:col-span-2">
            {selectedEmail ? (
              <Card className="p-6">
                {renderEmailDetail(selectedEmail)}
              </Card>
            ) : (
              <Card className="p-6 text-center text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select an email to view details</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
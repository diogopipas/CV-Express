import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import {
  Mail,
  MailOpen,
  Calendar,
  ThumbsDown,
  Gift,
  MessageSquare,
  ClipboardList,
  Search,
  Filter
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

const categoryIcons = {
  general: MessageSquare,
  interview: Calendar,
  rejection: ThumbsDown,
  offer: Gift,
  followup: Mail,
  assessment: ClipboardList
};

const categoryColors = {
  general: 'bg-gray-100 text-gray-700',
  interview: 'bg-purple-100 text-purple-700',
  rejection: 'bg-red-100 text-red-700',
  offer: 'bg-green-100 text-green-700',
  followup: 'bg-blue-100 text-blue-700',
  assessment: 'bg-orange-100 text-orange-700'
};

export default function Inbox() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isReadFilter, setIsReadFilter] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    fetchEmails();
    fetchStats();
  }, [categoryFilter, isReadFilter]);

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

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/emails/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error: any) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleSelectEmail = async (email: Email) => {
    setSelectedEmail(email);

    // Mark as read if unread
    if (!email.isRead) {
      try {
        const token = localStorage.getItem('token');
        await axios.patch(
          `${API_URL}/emails/${email._id}/read`,
          { isRead: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchEmails();
        fetchStats();
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
      fetchStats();
    } catch (error: any) {
      toast.error('Failed to update email');
    }
  };

  const handleDelete = async (emailId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/emails/${emailId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Email deleted');
      setSelectedEmail(null);
      fetchEmails();
      fetchStats();
    } catch (error: any) {
      toast.error('Failed to delete email');
    }
  };

  const formatDate = (dateString: string) => {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Application Inbox</h1>
          <p className="text-muted-foreground">
            Emails sent to your dedicated application address
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Unread</p>
            <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Interviews</p>
            <p className="text-2xl font-bold text-purple-600">{stats.interviews}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Offers</p>
            <p className="text-2xl font-bold text-green-600">{stats.offers}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Rejections</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejections}</p>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Filters */}
          <Card className="p-2">
            <div className="flex gap-1 mb-2">
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
            {loading ? (
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
                            {formatDate(email.receivedAt)}
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
                      onClick={() => handleDelete(selectedEmail._id)}
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
    </div>
  );
}


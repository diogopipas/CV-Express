import { useState } from 'react';
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Trash2,
  Plus,
  Briefcase,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Application, applicationService } from '../services/api';
import { useApplicationStore } from '../store/useApplicationStore';
import { toast } from 'sonner';

interface ApplicationDetailProps {
  application: Application;
  onUpdate: () => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offered', label: 'Offered' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-gray-500' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
];

const ApplicationDetail = ({ application, onUpdate }: ApplicationDetailProps) => {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState<string>('general');
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateApplication, removeApplication } = useApplicationStore();

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await applicationService.updateStatus(application._id, newStatus);
      updateApplication(application._id, { status: newStatus as any });
      toast.success('Status updated successfully');
      onUpdate();
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    setIsUpdating(true);
    try {
      await applicationService.updateApplication(application._id, {
        priority: newPriority as any,
      });
      updateApplication(application._id, { priority: newPriority as any });
      toast.success('Priority updated successfully');
      onUpdate();
    } catch (error) {
      console.error('Update priority error:', error);
      toast.error('Failed to update priority');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      toast.error('Please enter a note');
      return;
    }

    setIsUpdating(true);
    try {
      await applicationService.addNote(application._id, {
        text: noteText,
        type: noteType,
      });
      toast.success('Note added successfully');
      setNoteText('');
      setNoteType('general');
      setIsAddingNote(false);
      onUpdate();
    } catch (error) {
      console.error('Add note error:', error);
      toast.error('Failed to add note');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }

    setIsUpdating(true);
    try {
      await applicationService.deleteApplication(application._id);
      removeApplication(application._id);
      toast.success('Application deleted successfully');
    } catch (error) {
      console.error('Delete application error:', error);
      toast.error('Failed to delete application');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      case 'applied':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'interviewing':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'offered':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'accepted':
        return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400';
      case 'withdrawn':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Job Information */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl">{application.jobId.title}</CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground mt-2">
              <Building2 className="h-4 w-4" />
              <span>{application.jobId.company}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(application.status)}>
              {application.status}
            </Badge>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              disabled={isUpdating}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{application.jobId.location}</span>
            </div>

            {application.jobId.salary && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>{application.jobId.salary}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Applied: {formatDate(application.appliedDate)}</span>
            </div>

            {application.jobId.employmentType && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span className="capitalize">
                  {application.jobId.employmentType.replace('-', ' ')}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">{application.jobId.description}</p>
          </div>

          <a
            href={application.jobId.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View original posting
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>

      {/* Status and Priority Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={application.status}
              onValueChange={handleStatusChange}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={application.priority}
              onValueChange={handlePriorityChange}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${option.color}`} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Cover Letter */}
      {application.coverLetter && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cover Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm whitespace-pre-wrap">{application.coverLetter}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {application.timeline.map((event, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {index < application.timeline.length - 1 && (
                    <div className="w-px h-full bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium">{event.action}</p>
                  {event.details && (
                    <p className="text-xs text-muted-foreground">{event.details}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(event.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Notes</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddingNote(!isAddingNote)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Note
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAddingNote && (
            <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
              <div className="space-y-2">
                <Label htmlFor="note-type">Note Type</Label>
                <Select value={noteType} onValueChange={setNoteType}>
                  <SelectTrigger id="note-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="rejection">Rejection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note-text">Note</Label>
                <textarea
                  id="note-text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter your note here..."
                  className="w-full min-h-[100px] p-3 rounded-md border bg-background resize-y"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddNote} disabled={isUpdating} size="sm">
                  Save Note
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingNote(false);
                    setNoteText('');
                    setNoteType('general');
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {application.notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No notes yet. Add one to track your progress!
            </p>
          ) : (
            <div className="space-y-3">
              {application.notes.map((note, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {note.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(note.date)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.text}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationDetail;


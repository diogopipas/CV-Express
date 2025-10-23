import Application from '../models/Application';
import Job from '../models/Job';
import { IEmail } from '../models/Email';

export type EmailCategory = 'general' | 'interview' | 'rejection' | 'offer' | 'followup' | 'assessment';

interface ClassificationResult {
  category: EmailCategory;
  confidence: number;
  metadata?: {
    interviewDate?: Date;
    interviewLocation?: string;
    interviewType?: 'phone' | 'video' | 'onsite';
    salaryOffer?: string;
    assessmentDeadline?: Date;
    [key: string]: any;
  };
}

/**
 * Classify email based on content
 */
export function classifyEmail(subject: string, body: string): ClassificationResult {
  const text = `${subject} ${body}`.toLowerCase();

  // Interview invitation patterns
  const interviewKeywords = [
    'interview', 'meet with', 'schedule', 'call with', 'video call',
    'phone screen', 'screening call', 'coffee chat', 'invitation to interview',
    'would like to speak', 'available for a call', 'discuss your application'
  ];

  // Rejection patterns
  const rejectionKeywords = [
    'unfortunately', 'regret to inform', 'not moving forward', 'decided to pursue',
    'other candidates', 'not selected', 'will not be proceeding', 'wish you the best',
    'not a fit', 'different direction', 'position has been filled'
  ];

  // Offer patterns
  const offerKeywords = [
    'offer', 'pleased to offer', 'employment offer', 'job offer', 'welcome to',
    'compensation package', 'start date', 'accept the position', 'offer letter'
  ];

  // Assessment/test patterns
  const assessmentKeywords = [
    'assessment', 'coding challenge', 'technical test', 'take-home',
    'assignment', 'complete the following', 'skills test', 'challenge'
  ];

  // Follow-up patterns
  const followupKeywords = [
    'follow up', 'checking in', 'status update', 'next steps', 'update on',
    'progress of your application', 'wanted to touch base'
  ];

  // Score each category
  const scores = {
    interview: countMatches(text, interviewKeywords),
    rejection: countMatches(text, rejectionKeywords),
    offer: countMatches(text, offerKeywords),
    assessment: countMatches(text, assessmentKeywords),
    followup: countMatches(text, followupKeywords),
    general: 0
  };

  // Find category with highest score
  let maxScore = 0;
  let category: EmailCategory = 'general';

  Object.entries(scores).forEach(([cat, score]) => {
    if (score > maxScore) {
      maxScore = score;
      category = cat as EmailCategory;
    }
  });

  // Extract metadata based on category
  const metadata = extractMetadata(category, subject, body);

  return {
    category,
    confidence: Math.min(maxScore / 3, 1), // Normalize confidence
    metadata
  };
}

/**
 * Count keyword matches in text
 */
function countMatches(text: string, keywords: string[]): number {
  let count = 0;
  keywords.forEach(keyword => {
    if (text.includes(keyword)) {
      count++;
    }
  });
  return count;
}

/**
 * Extract metadata from email based on category
 */
function extractMetadata(category: EmailCategory, subject: string, body: string): any {
  const metadata: any = {};

  if (category === 'interview') {
    // Try to extract interview date
    const dateMatch = body.match(/\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?,?\s+(?:\d{4}|\d{1,2}:\d{2})/i);
    if (dateMatch) {
      metadata.interviewDateText = dateMatch[0];
    }

    // Interview type
    if (body.toLowerCase().includes('video') || body.toLowerCase().includes('zoom') || body.toLowerCase().includes('teams')) {
      metadata.interviewType = 'video';
    } else if (body.toLowerCase().includes('phone')) {
      metadata.interviewType = 'phone';
    } else if (body.toLowerCase().includes('office') || body.toLowerCase().includes('onsite')) {
      metadata.interviewType = 'onsite';
    }
  }

  if (category === 'offer') {
    // Try to extract salary
    const salaryMatch = body.match(/\$[\d,]+(?:k)?(?:\s*(?:per|\/)\s*(?:year|annum|annually))?/i);
    if (salaryMatch) {
      metadata.salaryOffer = salaryMatch[0];
    }

    // Try to extract start date
    const startDateMatch = body.match(/start\s+date[:\s]+[a-z]+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}/i);
    if (startDateMatch) {
      metadata.startDate = startDateMatch[0];
    }
  }

  if (category === 'assessment') {
    // Try to extract deadline
    const deadlineMatch = body.match(/(?:due|deadline|complete\s+by|submit\s+by)[:\s]+[a-z]+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}/i);
    if (deadlineMatch) {
      metadata.assessmentDeadline = deadlineMatch[0];
    }
  }

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

/**
 * Link email to application by matching company/job title
 */
export async function linkEmailToApplication(
  userId: string,
  email: IEmail
): Promise<string | null> {
  try {
    const text = `${email.subject} ${email.body} ${email.from}`.toLowerCase();

    // Get all applications for this user
    const applications = await Application.find({ userId })
      .populate('jobId')
      .sort({ appliedDate: -1 })
      .limit(50); // Check last 50 applications

    // Try to match by company or job title
    for (const app of applications) {
      if (!app.jobId) continue;

      const job = app.jobId as any; // Cast to any to access populated fields
      const company = job.company?.toLowerCase() || '';
      const title = job.title?.toLowerCase() || '';

      // Check if email mentions company or job title
      if ((company && text.includes(company)) || (title && text.includes(title))) {
        return String(app._id);
      }
    }

    return null;
  } catch (error) {
    console.error('Error linking email to application:', error);
    return null;
  }
}

/**
 * Suggest application status update based on email category
 */
export function suggestStatusUpdate(category: EmailCategory): string | null {
  const statusMap: Record<EmailCategory, string | null> = {
    interview: 'interviewing',
    rejection: 'rejected',
    offer: 'offered',
    assessment: 'interviewing',
    followup: null,
    general: null
  };

  return statusMap[category];
}

/**
 * Auto-update application status based on email
 */
export async function autoUpdateApplicationStatus(
  applicationId: string,
  category: EmailCategory,
  emailSubject: string
): Promise<boolean> {
  try {
    const newStatus = suggestStatusUpdate(category);
    if (!newStatus) {
      return false;
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return false;
    }

    // Don't downgrade status (e.g., from 'offered' to 'interviewing')
    const statusHierarchy = ['pending', 'applied', 'interviewing', 'offered', 'rejected', 'accepted'];
    const currentIndex = statusHierarchy.indexOf(application.status);
    const newIndex = statusHierarchy.indexOf(newStatus);

    if (newIndex > currentIndex || newStatus === 'rejected') {
      application.status = newStatus as any;
      
      // Add timeline event
      application.timeline.push({
        action: `Status updated via email`,
        date: new Date(),
        details: `Email: ${emailSubject.substring(0, 50)}...`
      } as any);

      await application.save();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error auto-updating application status:', error);
    return false;
  }
}


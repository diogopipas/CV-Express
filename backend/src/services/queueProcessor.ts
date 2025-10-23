import ApplicationQueue, { IApplicationQueue } from '../models/ApplicationQueue';
import Application from '../models/Application';
import Job from '../models/Job';
import User from '../models/User';
import Resume from '../models/Resume';

interface ProcessingResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
}

/**
 * Get approved jobs from queue ready for processing
 */
export async function getApprovedQueue(userId: string, limit: number = 10): Promise<IApplicationQueue[]> {
  try {
    const queueItems = await ApplicationQueue
      .find({
        userId,
        status: 'approved'
      })
      .populate('jobId')
      .populate('resumeId')
      .sort({ queuedAt: 1 }) // Process oldest first
      .limit(limit);

    return queueItems;
  } catch (error) {
    console.error('Error fetching approved queue:', error);
    return [];
  }
}

/**
 * Mark queue item as processing
 */
export async function markAsProcessing(queueItemId: string): Promise<boolean> {
  try {
    await ApplicationQueue.findByIdAndUpdate(queueItemId, {
      status: 'processing',
      processedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error marking queue item as processing:', error);
    return false;
  }
}

/**
 * Mark queue item as completed
 */
export async function markAsCompleted(queueItemId: string, applicationId: string): Promise<boolean> {
  try {
    await ApplicationQueue.findByIdAndUpdate(queueItemId, {
      status: 'completed',
      processedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error marking queue item as completed:', error);
    return false;
  }
}

/**
 * Mark queue item as failed with error message
 */
export async function markAsFailed(queueItemId: string, errorMessage: string): Promise<boolean> {
  try {
    const queueItem = await ApplicationQueue.findById(queueItemId);
    if (!queueItem) return false;

    queueItem.status = 'failed';
    queueItem.errorMessage = errorMessage;
    queueItem.retryCount += 1;
    queueItem.processedAt = new Date();

    // If retry count is less than 3, move back to approved for retry
    if (queueItem.retryCount < 3) {
      queueItem.status = 'approved';
    }

    await queueItem.save();
    return true;
  } catch (error) {
    console.error('Error marking queue item as failed:', error);
    return false;
  }
}

/**
 * Create application record from queue item
 */
export async function createApplicationFromQueue(queueItem: IApplicationQueue): Promise<string | null> {
  try {
    const application = new Application({
      userId: queueItem.userId,
      jobId: queueItem.jobId,
      resumeId: queueItem.resumeId,
      status: 'pending', // Will be updated to 'applied' by extension
      appliedDate: new Date(),
      submissionMethod: 'cv_express_extension',
      priority: 'medium',
      timeline: [
        {
          action: 'Added to application queue',
          date: queueItem.queuedAt,
          details: `Match score: ${queueItem.matchScore}%`
        },
        {
          action: 'Processing auto-application',
          date: new Date(),
          details: 'Sent to extension for form filling'
        }
      ]
    });

    await application.save();
    return String(application._id);
  } catch (error) {
    console.error('Error creating application from queue:', error);
    return null;
  }
}

/**
 * Process a batch of approved applications
 * Returns a list of jobs to be processed by the extension
 */
export async function processBatch(userId: string, batchSize: number = 5): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    success: true,
    processed: 0,
    failed: 0,
    errors: []
  };

  try {
    const queueItems = await getApprovedQueue(userId, batchSize);

    if (queueItems.length === 0) {
      return result;
    }

    for (const queueItem of queueItems) {
      try {
        // Mark as processing
        await markAsProcessing(String(queueItem._id));

        // Create application record
        const applicationId = await createApplicationFromQueue(queueItem);

        if (applicationId) {
          // Mark as completed (actual application happens in extension)
          await markAsCompleted(String(queueItem._id), applicationId);
          result.processed++;
        } else {
          await markAsFailed(String(queueItem._id), 'Failed to create application record');
          result.failed++;
          result.errors.push(`Queue item ${queueItem._id}: Failed to create application`);
        }
      } catch (error: any) {
        await markAsFailed(String(queueItem._id), error.message);
        result.failed++;
        result.errors.push(`Queue item ${queueItem._id}: ${error.message}`);
      }
    }

    result.success = result.failed === 0;
    return result;
  } catch (error: any) {
    console.error('Error processing batch:', error);
    result.success = false;
    result.errors.push(error.message);
    return result;
  }
}

/**
 * Get processing statistics for user
 */
export async function getQueueStats(userId: string) {
  try {
    const stats = await ApplicationQueue.aggregate([
      { $match: { userId: userId as any } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result: Record<string, number> = {
      pending_review: 0,
      approved: 0,
      rejected: 0,
      processing: 0,
      completed: 0,
      failed: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
    });

    return result;
  } catch (error) {
    console.error('Error getting queue stats:', error);
    return null;
  }
}

/**
 * Prepare auto-fill data for a queue item
 */
export async function prepareAutoFillData(queueItem: IApplicationQueue): Promise<any> {
  try {
    const user = await User.findById(queueItem.userId);
    const resume = await Resume.findById(queueItem.resumeId);

    if (!user) {
      throw new Error('User not found');
    }

    // Combine data from user profile and resume
    const autoFillData: any = {
      // Basic info
      name: user.name,
      email: user.applicationEmail || user.email,
      phone: user.applicationPreferences?.phone || user.profile?.workExperience?.[0]?.location,
      linkedin: user.applicationPreferences?.linkedinUrl || user.linkedinProfile?.profileUrl,
      
      // Application specifics
      coverLetter: user.applicationPreferences?.defaultCoverLetter,
      
      // Work preferences
      availableStartDate: user.jobPreferences?.availabilityDate,
      noticePeriod: user.jobPreferences?.noticePeriod,
      workAuthorization: user.jobPreferences?.workAuthorization,
      willingToRelocate: user.jobPreferences?.willingToRelocate,
      
      // From resume
      currentTitle: resume?.parsedData?.workExperience?.[0]?.title || user.profile?.currentJobTitle,
      yearsOfExperience: user.profile?.yearsOfExperience,
      skills: resume?.extractedSkills || user.profile?.skills || [],
      
      // Resume file info
      resumeId: resume?._id,
      resumeFilename: resume?.originalName
    };

    // Remove undefined values
    Object.keys(autoFillData).forEach(key => {
      if (autoFillData[key] === undefined) {
        delete autoFillData[key];
      }
    });

    return autoFillData;
  } catch (error) {
    console.error('Error preparing auto-fill data:', error);
    return {};
  }
}


import express, { Request, Response } from 'express';
import Application from '../models/Application';
import Job from '../models/Job';
import { protect } from '../middleware/auth';
import ApplicationQueue from '../models/ApplicationQueue';
import User from '../models/User';
import Resume from '../models/Resume';
import { calculateMatchScore } from '../services/matchingService';
import { getQueueStats, processBatch, prepareAutoFillData } from '../services/queueProcessor';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// POST /api/applications - Create new application
router.post('/applications', async (req: Request, res: Response) => {
  try {
    const { jobId, resumeId, coverLetter, submissionMethod } = req.body;
    const userId = (req as any).user._id;

    if (!jobId || !resumeId) {
      return res.status(400).json({ error: 'Job ID and Resume ID are required' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if application already exists for this job
    const existingApplication = await Application.findOne({ userId, jobId });
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied to this job' });
    }

    const application = new Application({
      userId,
      jobId,
      resumeId,
      coverLetter,
      submissionMethod: submissionMethod || 'manual',
      status: 'pending'
    });

    await application.save();

    // Populate job and resume details
    await application.populate('jobId resumeId');

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application created successfully'
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// GET /api/applications - Get all applications with filtering/sorting
router.get('/applications', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const {
      status,
      priority,
      search,
      sortBy = 'appliedDate',
      order = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    const query: any = { userId };

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Search by job title or company
    if (search) {
      const jobs = await Job.find({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      query.jobId = { $in: jobs.map(j => j._id) };
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions: any = { [sortBy as string]: sortOrder };

    const applications = await Application.find(query)
      .populate('jobId resumeId')
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      data: applications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// GET /api/applications/stats - Get application statistics
router.get('/applications/stats', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    const totalApplications = await Application.countDocuments({ userId });
    const pendingApplications = await Application.countDocuments({ userId, status: 'pending' });
    const appliedApplications = await Application.countDocuments({ userId, status: 'applied' });
    const interviewingApplications = await Application.countDocuments({ userId, status: 'interviewing' });
    const offeredApplications = await Application.countDocuments({ userId, status: 'offered' });
    const rejectedApplications = await Application.countDocuments({ userId, status: 'rejected' });
    const acceptedApplications = await Application.countDocuments({ userId, status: 'accepted' });

    // Calculate success rate (offers / total non-pending applications)
    const nonPendingApplications = totalApplications - pendingApplications;
    const successRate = nonPendingApplications > 0 
      ? ((offeredApplications + acceptedApplications) / nonPendingApplications * 100).toFixed(1)
      : 0;

    // Calculate average response time (time from applied to any status change)
    const recentApplications = await Application.find({ 
      userId, 
      status: { $ne: 'pending' } 
    })
      .sort({ appliedDate: -1 })
      .limit(10);

    let avgResponseTime = 0;
    if (recentApplications.length > 0) {
      const responseTimes = recentApplications
        .filter(app => app.timeline.length > 1)
        .map(app => {
          const firstEvent = app.timeline[0].date.getTime();
          const secondEvent = app.timeline[1].date.getTime();
          return (secondEvent - firstEvent) / (1000 * 60 * 60 * 24); // days
        });
      
      if (responseTimes.length > 0) {
        avgResponseTime = Math.round(
          responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        );
      }
    }

    res.json({
      success: true,
      data: {
        total: totalApplications,
        pending: pendingApplications,
        applied: appliedApplications,
        interviewing: interviewingApplications,
        offered: offeredApplications,
        rejected: rejectedApplications,
        accepted: acceptedApplications,
        successRate: Number(successRate),
        avgResponseTime
      }
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({ error: 'Failed to fetch application statistics' });
  }
});

// GET /api/applications/:id - Get single application
router.get('/applications/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const application = await Application.findOne({
      _id: req.params.id,
      userId
    }).populate('jobId resumeId');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// PATCH /api/applications/:id/status - Update application status
router.patch('/applications/:id/status', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'applied', 'interviewing', 'offered', 'rejected', 'accepted', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      userId
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.status = status;
    await application.save();

    await application.populate('jobId resumeId');

    res.json({
      success: true,
      data: application,
      message: 'Status updated successfully'
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// PATCH /api/applications/:id - Update application
router.patch('/applications/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const updates = req.body;

    // Don't allow updating certain fields directly
    delete updates.userId;
    delete updates.jobId;
    delete updates.timeline;

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('jobId resumeId');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({
      success: true,
      data: application,
      message: 'Application updated successfully'
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// POST /api/applications/:id/notes - Add note to application
router.post('/applications/:id/notes', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { text, type } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Note text is required' });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      userId
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.notes.push({
      text,
      type: type || 'general',
      date: new Date()
    });

    // Add timeline event
    application.timeline.push({
      action: 'Note added',
      date: new Date(),
      details: text.substring(0, 100)
    });

    await application.save();
    await application.populate('jobId resumeId');

    res.json({
      success: true,
      data: application,
      message: 'Note added successfully'
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// DELETE /api/applications/:id - Delete application
router.delete('/applications/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

// ========== APPLICATION QUEUE ROUTES ==========

// POST /api/applications/queue - Add job to application queue
router.post('/queue', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { jobId, resumeId } = req.body;

    if (!jobId || !resumeId) {
      return res.status(400).json({ error: 'Job ID and Resume ID are required' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if already in queue
    const existingQueue = await ApplicationQueue.findOne({ userId, jobId });
    if (existingQueue) {
      return res.status(400).json({ error: 'Job already in queue' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ userId, jobId });
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied to this job' });
    }

    // Get user profile for matching
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate match score
    const { matchScore, matchReasons } = calculateMatchScore(user, job);

    // Prepare auto-fill data
    const resume = await Resume.findById(resumeId);
    const autoFillData: any = {
      name: user.name,
      email: user.applicationEmail || user.email,
      phone: user.applicationPreferences?.phone,
      linkedin: user.applicationPreferences?.linkedinUrl,
      coverLetter: user.applicationPreferences?.defaultCoverLetter
    };

    // Create queue item
    const queueItem = new ApplicationQueue({
      userId,
      jobId,
      resumeId,
      matchScore,
      matchReasons,
      autoFillData,
      status: 'pending_review'
    });

    await queueItem.save();
    await queueItem.populate('jobId resumeId');

    res.status(201).json({
      success: true,
      data: queueItem,
      message: 'Job added to queue successfully'
    });
  } catch (error) {
    console.error('Add to queue error:', error);
    res.status(500).json({ error: 'Failed to add job to queue' });
  }
});

// GET /api/applications/queue - Get queued applications
router.get('/queue', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { status, sortBy = 'matchScore', order = 'desc' } = req.query;

    const query: any = { userId };

    if (status && status !== 'all') {
      query.status = status;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions: any = { [sortBy as string]: sortOrder };

    const queueItems = await ApplicationQueue.find(query)
      .populate('jobId resumeId')
      .sort(sortOptions);

    // Get stats
    const stats = await getQueueStats(userId);

    res.json({
      success: true,
      data: queueItems,
      stats
    });
  } catch (error) {
    console.error('Get queue error:', error);
    res.status(500).json({ error: 'Failed to fetch queue' });
  }
});

// PATCH /api/applications/queue/:id/review - Approve or reject queue item
router.patch('/queue/:id/review', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { action } = req.body; // 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Valid action (approve/reject) is required' });
    }

    const queueItem = await ApplicationQueue.findOne({
      _id: req.params.id,
      userId
    });

    if (!queueItem) {
      return res.status(404).json({ error: 'Queue item not found' });
    }

    queueItem.status = action === 'approve' ? 'approved' : 'rejected';
    queueItem.reviewedAt = new Date();
    await queueItem.save();

    await queueItem.populate('jobId resumeId');

    res.json({
      success: true,
      data: queueItem,
      message: `Job ${action}d successfully`
    });
  } catch (error) {
    console.error('Review queue item error:', error);
    res.status(500).json({ error: 'Failed to review queue item' });
  }
});

// POST /api/applications/queue/bulk-approve - Bulk approve queue items
router.post('/queue/bulk-approve', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { queueIds } = req.body;

    if (!queueIds || !Array.isArray(queueIds)) {
      return res.status(400).json({ error: 'Queue IDs array is required' });
    }

    const result = await ApplicationQueue.updateMany(
      {
        _id: { $in: queueIds },
        userId,
        status: 'pending_review'
      },
      {
        $set: {
          status: 'approved',
          reviewedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} jobs approved successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk approve error:', error);
    res.status(500).json({ error: 'Failed to bulk approve' });
  }
});

// POST /api/applications/queue/process - Process approved applications
router.post('/queue/process', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { batchSize = 5 } = req.body;

    const result = await processBatch(userId, batchSize);

    res.json({
      success: result.success,
      data: result,
      message: `Processed ${result.processed} applications, ${result.failed} failed`
    });
  } catch (error) {
    console.error('Process queue error:', error);
    res.status(500).json({ error: 'Failed to process queue' });
  }
});

// DELETE /api/applications/queue/:id - Remove from queue
router.delete('/queue/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    const queueItem = await ApplicationQueue.findOneAndDelete({
      _id: req.params.id,
      userId
    });

    if (!queueItem) {
      return res.status(404).json({ error: 'Queue item not found' });
    }

    res.json({
      success: true,
      message: 'Removed from queue successfully'
    });
  } catch (error) {
    console.error('Remove from queue error:', error);
    res.status(500).json({ error: 'Failed to remove from queue' });
  }
});

export default router;


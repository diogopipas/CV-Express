import express, { Request, Response } from 'express';
import Email from '../models/Email';
import User from '../models/User';
import { protect } from '../middleware/auth';
import { classifyEmail, linkEmailToApplication, autoUpdateApplicationStatus } from '../services/emailClassifier';

const router = express.Router();

// POST /api/emails/webhook - Receive incoming emails (webhook endpoint)
// Note: This endpoint does NOT require authentication (external webhook)
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    // TODO: Verify webhook secret from email service provider for security
    // const webhookSecret = req.headers['x-webhook-secret'];
    // if (webhookSecret !== process.env.EMAIL_WEBHOOK_SECRET) {
    //   return res.status(401).json({ error: 'Invalid webhook secret' });
    // }

    const { from, to, subject, text, html, raw } = req.body;

    if (!from || !to || !subject) {
      return res.status(400).json({ error: 'Missing required email fields' });
    }

    // Extract user ID from application email (applications-{userId}@cvexpress.com)
    const emailMatch = to.match(/applications-([a-f0-9]+)@/i);
    if (!emailMatch) {
      return res.status(400).json({ error: 'Invalid recipient email format' });
    }

    const userIdSuffix = emailMatch[1];
    
    // Find user by their applicationEmail
    const user = await User.findOne({ 
      applicationEmail: new RegExp(userIdSuffix, 'i') 
    });

    if (!user) {
      console.error(`No user found with application email containing: ${userIdSuffix}`);
      return res.status(404).json({ error: 'User not found for this application email' });
    }

    // Classify email
    const classification = classifyEmail(subject, text || '');

    // Create email record
    const email = new Email({
      userId: user._id,
      from,
      to,
      subject,
      body: text || '',
      htmlBody: html,
      category: classification.category,
      receivedAt: new Date(),
      rawEmail: raw,
      metadata: classification.metadata
    });

    await email.save();

    // Try to link to application
    const applicationId = await linkEmailToApplication(email.userId.toString(), email);
    if (applicationId) {
      email.applicationId = applicationId as any;
      await email.save();

      // Auto-update application status
      await autoUpdateApplicationStatus(applicationId, email.category, email.subject);
    }

    res.status(201).json({
      success: true,
      message: 'Email received and processed'
    });
  } catch (error) {
    console.error('Email webhook error:', error);
    res.status(500).json({ error: 'Failed to process email' });
  }
});

// Apply auth middleware to all routes AFTER webhook
router.use(protect);

// GET /api/emails - Get user's emails
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const {
      category,
      isRead,
      applicationId,
      page = 1,
      limit = 50,
      sortBy = 'receivedAt',
      order = 'desc'
    } = req.query;

    const query: any = { userId };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    if (applicationId) {
      query.applicationId = applicationId;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions: any = { [sortBy as string]: sortOrder };

    const emails = await Email.find(query)
      .populate('applicationId')
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Email.countDocuments(query);
    const unreadCount = await Email.countDocuments({ userId, isRead: false });

    res.json({
      success: true,
      data: emails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get emails error:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// GET /api/emails/stats - Get email statistics
// NOTE: This must come BEFORE /:id to avoid matching "stats" as an id
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    const total = await Email.countDocuments({ userId });
    const unread = await Email.countDocuments({ userId, isRead: false });
    const interviews = await Email.countDocuments({ userId, category: 'interview' });
    const offers = await Email.countDocuments({ userId, category: 'offer' });
    const rejections = await Email.countDocuments({ userId, category: 'rejection' });

    res.json({
      success: true,
      data: {
        total,
        unread,
        interviews,
        offers,
        rejections
      }
    });
  } catch (error) {
    console.error('Get email stats error:', error);
    res.status(500).json({ error: 'Failed to fetch email statistics' });
  }
});

// GET /api/emails/:id - Get single email
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    
    const email = await Email.findOne({
      _id: req.params.id,
      userId
    }).populate('applicationId');

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Mark as read if it's not already
    if (!email.isRead) {
      email.isRead = true;
      await email.save();
    }

    res.json({
      success: true,
      data: email
    });
  } catch (error) {
    console.error('Get email error:', error);
    res.status(500).json({ error: 'Failed to fetch email' });
  }
});

// PATCH /api/emails/:id/read - Mark email as read/unread
router.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { isRead } = req.body;

    if (typeof isRead !== 'boolean') {
      return res.status(400).json({ error: 'isRead must be a boolean' });
    }

    const email = await Email.findOneAndUpdate(
      { _id: req.params.id, userId },
      { isRead },
      { new: true }
    ).populate('applicationId');

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.json({
      success: true,
      data: email,
      message: `Email marked as ${isRead ? 'read' : 'unread'}`
    });
  } catch (error) {
    console.error('Mark email read error:', error);
    res.status(500).json({ error: 'Failed to update email' });
  }
});

// POST /api/emails/:id/link - Manually link email to application
router.post('/:id/link', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({ error: 'Application ID is required' });
    }

    const email = await Email.findOne({
      _id: req.params.id,
      userId
    });

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    email.applicationId = applicationId;
    await email.save();
    await email.populate('applicationId');

    res.json({
      success: true,
      data: email,
      message: 'Email linked to application successfully'
    });
  } catch (error) {
    console.error('Link email error:', error);
    res.status(500).json({ error: 'Failed to link email' });
  }
});

// DELETE /api/emails/:id - Delete email
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    const email = await Email.findOneAndDelete({
      _id: req.params.id,
      userId
    });

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.json({
      success: true,
      message: 'Email deleted successfully'
    });
  } catch (error) {
    console.error('Delete email error:', error);
    res.status(500).json({ error: 'Failed to delete email' });
  }
});

export default router;


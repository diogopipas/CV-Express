import express, { Request, Response } from 'express';
import { protect } from '../middleware/auth';
import User from '../models/User';
import Resume from '../models/Resume';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// GET /api/extension/user-data - Get user profile data for auto-fill
router.get('/extension/user-data', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        applicationPreferences: user.applicationPreferences,
      },
    });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// POST /api/extension/track - Track extension usage
router.post('/extension/track', async (req: Request, res: Response) => {
  try {
    const { eventType, metadata, timestamp } = req.body;
    const userId = (req as any).user._id;

    // Log extension usage (you can store this in a separate collection if needed)
    console.log('Extension usage:', {
      userId,
      eventType,
      metadata,
      timestamp,
    });

    // You could save this to a UsageLog model for analytics
    // For now, we just acknowledge receipt
    
    res.json({
      success: true,
      message: 'Usage tracked',
    });
  } catch (error) {
    console.error('Track usage error:', error);
    res.status(500).json({ error: 'Failed to track usage' });
  }
});

// GET /api/extension/resume/:id/blob - Download resume file as blob
router.get('/extension/resume/:id/blob', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Security: Ensure user owns this resume
    // Note: Resume model doesn't have userId field currently
    // You might want to add userId to Resume model for security

    // Send the file
    res.download(resume.filePath, resume.originalName);
  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({ error: 'Failed to download resume' });
  }
});

// GET /api/extension/templates - Get cover letter templates
router.get('/extension/templates', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user's default cover letter and any saved templates
    const templates = [
      {
        id: 'default',
        name: 'Default Cover Letter',
        content: user.applicationPreferences?.defaultCoverLetter || '',
      },
    ];

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

export default router;


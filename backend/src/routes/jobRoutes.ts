import express, { Request, Response } from 'express';
import Job from '../models/Job';
import { scrapeJobs } from '../services/scrapers/scraperManager';
import axios from 'axios';
import { protect } from '../middleware/auth';
import User from '../models/User';
import Resume from '../models/Resume';
import ApplicationQueue from '../models/ApplicationQueue';
import Application from '../models/Application';
import { calculateMatchScore } from '../services/matchingService';
import { prepareAutoFillData } from '../services/queueProcessor';

const router = express.Router();

// Minimum match score threshold for auto-queueing (configurable)
const MIN_MATCH_SCORE = parseInt(process.env.MIN_AUTO_QUEUE_MATCH_SCORE || '60', 10);

/**
 * Automatically analyze and queue jobs after scraping
 */
async function autoAnalyzeAndQueue(userId: string, jobs: any[], resumeId?: string) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found for auto-queue');
      return { queued: 0, analyzed: jobs.length };
    }

    let queuedCount = 0;
    const queueResults = [];

    console.log(`🔍 Analyzing ${jobs.length} jobs for auto-queue...`);

    for (const job of jobs) {
      try {
        // Check if already in queue or already applied
        const existingQueue = await ApplicationQueue.findOne({ userId, jobId: job._id });
        const existingApplication = await Application.findOne({ userId, jobId: job._id });
        
        if (existingQueue || existingApplication) {
          continue; // Skip if already queued or applied
        }

        // Calculate match score
        const { matchScore, matchReasons } = calculateMatchScore(user, job);

        // If match score is above threshold, add to queue
        if (matchScore >= MIN_MATCH_SCORE) {
          // Use provided resumeId or user's default resume
          let targetResumeId = resumeId;
          if (!targetResumeId) {
            const defaultResume = await Resume.findOne({ userId, isDefault: true });
            if (defaultResume) {
              targetResumeId = String(defaultResume._id);
            }
          }

          if (!targetResumeId) {
            console.warn(`No resume found for user ${userId}, skipping job ${job._id}`);
            continue;
          }

          // Create queue item with auto-fill data
          const queueItem = new ApplicationQueue({
            userId,
            jobId: job._id,
            resumeId: targetResumeId,
            matchScore,
            matchReasons,
            autoFillData: {
              name: user.name,
              email: user.connectedEmail || user.email,
              phone: user.applicationPreferences?.phone,
              linkedin: user.applicationPreferences?.linkedinUrl,
              coverLetter: user.applicationPreferences?.defaultCoverLetter
            },
            status: 'pending_review'
          });

          await queueItem.save();
          queuedCount++;
          
          queueResults.push({
            jobId: job._id,
            jobTitle: job.title,
            company: job.company,
            matchScore
          });

          console.log(`✅ Queued: ${job.title} at ${job.company} (${matchScore}% match)`);
        }
      } catch (error) {
        console.error(`Error processing job ${job._id} for auto-queue:`, error);
      }
    }

    console.log(`📊 Auto-queue complete: ${queuedCount}/${jobs.length} jobs added to queue`);

    return {
      analyzed: jobs.length,
      queued: queuedCount,
      minMatchScore: MIN_MATCH_SCORE,
      queuedJobs: queueResults
    };
  } catch (error) {
    console.error('Auto-queue error:', error);
    return { analyzed: jobs.length, queued: 0, error: 'Failed to auto-queue jobs' };
  }
}

// POST /api/scrape - Trigger scraping (with authentication for auto-queue)
router.post('/scrape', protect, async (req: Request, res: Response) => {
  try {
    const { keyword, location, resumeId, useCache = true, autoQueue = true } = req.body;
    const userId = (req as any).user?._id;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const result = await scrapeJobs({ keyword, location, resumeId, useCache });

    // Auto-analyze and queue jobs if user is authenticated and autoQueue is enabled
    let queueInfo = null;
    if (userId && autoQueue && result.jobs.length > 0) {
      queueInfo = await autoAnalyzeAndQueue(userId, result.jobs, resumeId);
    }

    // Create a more informative message
    let message = `Found ${result.count} ${result.count === 1 ? 'job' : 'jobs'}`;
    
    if (result.usedCache) {
      message += ` (from cache)`;
    } else if (result.newCount !== undefined && result.existingCount !== undefined) {
      if (result.newCount > 0 && result.existingCount > 0) {
        message += ` (${result.newCount} new, ${result.existingCount} already saved)`;
      } else if (result.newCount > 0) {
        message += ` (all new)`;
      } else if (result.existingCount > 0) {
        message += ` (all already saved)`;
      }
    }

    if (queueInfo && queueInfo.queued > 0) {
      message += `. ${queueInfo.queued} jobs automatically added to queue`;
    }

    res.json({
      success: true,
      message: message,
      data: result.jobs,
      newCount: result.newCount,
      existingCount: result.existingCount,
      usedCache: result.usedCache,
      errors: result.errors,
      queueInfo: queueInfo
    });
  } catch (error) {
    console.error('Scrape error:', error);
    res.status(500).json({ error: 'Failed to scrape jobs' });
  }
});

// GET /api/jobs - Get all jobs with filtering, pagination, sorting
router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      source, 
      location,
      country,
      region,
      search,
      resumeId,
      sortBy = 'scrapedDate',
      order = 'desc'
    } = req.query;

    const query: any = {};

    if (source) {
      query.source = source;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (country && country !== 'all') {
      query.country = country;
    }

    if (region && region !== 'all') {
      query.region = region;
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    if (resumeId) {
      query.resumeId = resumeId;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions: any = { [sortBy as string]: sortOrder };

    const jobs = await Job.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/saved - Get all saved jobs
router.get('/jobs/saved', async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find({ saved: true }).sort({ scrapedDate: -1 });
    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch saved jobs' });
  }
});

// GET /api/jobs/countries - Get list of all countries with job counts
router.get('/jobs/countries', async (req: Request, res: Response) => {
  try {
    const countries = await Job.aggregate([
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          _id: { $nin: [null, ''] }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const countriesData = countries.map(c => ({
      country: c._id,
      count: c.count
    }));

    res.json({
      success: true,
      data: countriesData
    });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

// GET /api/jobs/regions - Get list of regions/states for a specific country with job counts
router.get('/jobs/regions', async (req: Request, res: Response) => {
  try {
    const { country } = req.query;
    
    if (!country || country === 'all') {
      // If no country specified, return all regions
      const regions = await Job.aggregate([
        {
          $match: {
            region: { $nin: [null, ''] }
          }
        },
        {
          $group: {
            _id: {
              country: '$country',
              region: '$region'
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      const regionsData = regions.map(r => ({
        country: r._id.country,
        region: r._id.region,
        count: r.count
      }));

      return res.json({
        success: true,
        data: regionsData
      });
    }

    // Get regions for specific country
    const regions = await Job.aggregate([
      {
        $match: {
          country: country as string,
          region: { $nin: [null, ''] }
        }
      },
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const regionsData = regions.map(r => ({
      region: r._id,
      count: r.count
    }));

    res.json({
      success: true,
      data: regionsData
    });
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

// GET /api/jobs/detect-location - Detect user's country from IP
router.get('/jobs/detect-location', async (req: Request, res: Response) => {
  try {
    // Get IP from request
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const clientIp = Array.isArray(ip) ? ip[0] : ip.split(',')[0];

    // For local development, try to get the actual public IP
    const isLocalIp = !clientIp || clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('::ffff:127.0.0.1');
    
    try {
      // Try to detect location even for local IPs by using ip-api without IP parameter
      // This will use the server's public IP
      const geoUrl = isLocalIp 
        ? 'http://ip-api.com/json/' // Use server's public IP
        : `http://ip-api.com/json/${clientIp}`;
      
      const geoResponse = await axios.get(geoUrl, {
        timeout: 5000
      });

      if (geoResponse.data && geoResponse.data.status === 'success') {
        return res.json({
          success: true,
          data: {
            country: geoResponse.data.country,
            countryCode: geoResponse.data.countryCode,
            city: geoResponse.data.city,
            region: geoResponse.data.regionName,
            ip: isLocalIp ? 'local' : clientIp,
            isLocal: isLocalIp
          }
        });
      } else {
        throw new Error('Geolocation failed');
      }
    } catch (geoError) {
      // Fallback to 'all' instead of forcing US
      console.error('Geolocation error:', geoError);
      res.json({
        success: true,
        data: {
          country: 'all', // Don't force a country, show all
          countryCode: 'ALL',
          ip: clientIp,
          isLocal: isLocalIp,
          fallback: true
        }
      });
    }
  } catch (error) {
    console.error('Detect location error:', error);
    res.status(500).json({ error: 'Failed to detect location' });
  }
});

// GET /api/jobs/resume/:resumeId - Get jobs for a specific resume
router.get('/jobs/resume/:resumeId', async (req: Request, res: Response) => {
  try {
    const { resumeId } = req.params;
    const { 
      page = 1, 
      limit = 100,
      sortBy = 'scrapedDate',
      order = 'desc'
    } = req.query;

    const query = { resumeId };
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions: any = { [sortBy as string]: sortOrder };

    const jobs = await Job.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get resume jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch resume jobs' });
  }
});

// GET /api/jobs/:id - Get single job
router.get('/jobs/:id', async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// POST /api/jobs/:id/save - Toggle save status
router.post('/jobs/:id/save', async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    job.saved = !job.saved;
    await job.save();

    res.json({ 
      success: true, 
      data: job,
      message: job.saved ? 'Job saved' : 'Job unsaved'
    });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ error: 'Failed to save job' });
  }
});

// DELETE /api/jobs/:id - Delete job
router.delete('/jobs/:id', async (req: Request, res: Response) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

export default router;


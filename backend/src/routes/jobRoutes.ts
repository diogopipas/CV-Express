import express, { Request, Response } from 'express';
import Job from '../models/Job';
import { scrapeJobs } from '../services/scrapers/scraperManager';
import axios from 'axios';

const router = express.Router();

// POST /api/scrape - Trigger scraping
router.post('/scrape', async (req: Request, res: Response) => {
  try {
    const { keyword, location, resumeId, useCache = true } = req.body;

    if (!keyword || !location) {
      return res.status(400).json({ error: 'Keyword and location are required' });
    }

    const result = await scrapeJobs({ keyword, location, resumeId, useCache });

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

    res.json({
      success: true,
      message: message,
      data: result.jobs,
      newCount: result.newCount,
      existingCount: result.existingCount,
      usedCache: result.usedCache,
      errors: result.errors
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


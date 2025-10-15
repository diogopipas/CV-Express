import express, { Request, Response } from 'express';
import Job from '../models/Job';
import { scrapeJobs } from '../services/scrapers/scraperManager';

const router = express.Router();

// POST /api/scrape - Trigger scraping
router.post('/scrape', async (req: Request, res: Response) => {
  try {
    const { keyword, location, sources } = req.body;

    if (!keyword || !location) {
      return res.status(400).json({ error: 'Keyword and location are required' });
    }

    const result = await scrapeJobs({ keyword, location, sources });

    res.json({
      success: true,
      message: `Scraped ${result.count} jobs`,
      data: result.jobs,
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
      search,
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

    if (search) {
      query.$text = { $search: search as string };
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


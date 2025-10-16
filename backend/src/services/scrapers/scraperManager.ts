import { scrapeLinkedIn } from './linkedinScraper';
import { scrapeIndeed } from './indeedScraper';
import { scrapeGlassdoor } from './glassdoorScraper';
import { scrapeMockJobs } from './mockScraper';
import { scrapeAdzuna } from './adzunaScraper';
import Job from '../../models/Job';

interface ScrapeParams {
  keyword: string;
  location: string;
  sources?: ('LinkedIn' | 'Indeed' | 'Glassdoor')[];
  resumeId?: string;
}

// Toggle between mock, Adzuna API, and Puppeteer scrapers
const USE_MOCK_SCRAPER = process.env.USE_MOCK_SCRAPER === 'true'; // Default to false (use real APIs)
const USE_ADZUNA_API = process.env.ADZUNA_APP_ID && process.env.ADZUNA_API_KEY; // Auto-detect if Adzuna is configured

export const scrapeJobs = async ({ keyword, location, sources = ['LinkedIn', 'Indeed', 'Glassdoor'], resumeId }: ScrapeParams) => {
  const allJobs: any[] = [];
  const errors: any[] = [];

  if (USE_MOCK_SCRAPER) {
    // Use mock scraper for testing
    console.log('🎭 Using MOCK scraper for testing (set USE_MOCK_SCRAPER=false to use real APIs)');
    
    try {
      const mockJobs = await scrapeMockJobs(keyword, location);
      allJobs.push(...mockJobs);
    } catch (error: any) {
      console.error('Mock scraper error:', error);
      errors.push({ source: 'Mock', error: error.message });
    }
  } else if (USE_ADZUNA_API) {
    // Use Adzuna API (preferred real scraper)
    console.log('🌟 Using Adzuna API for real job listings');
    
    try {
      const adzunaJobs = await scrapeAdzuna(keyword, location);
      allJobs.push(...adzunaJobs);
      console.log(`✅ Adzuna API: Successfully fetched ${adzunaJobs.length} jobs`);
    } catch (error: any) {
      console.error('❌ Adzuna API error:', error.message);
      errors.push({ source: 'Adzuna', error: error.message });
      
      // Fallback to mock scraper if Adzuna fails
      console.log('⚠️ Falling back to mock scraper...');
      try {
        const mockJobs = await scrapeMockJobs(keyword, location);
        allJobs.push(...mockJobs);
      } catch (mockError: any) {
        console.error('Mock scraper fallback error:', mockError);
        errors.push({ source: 'Mock Fallback', error: mockError.message });
      }
    }
  } else {
    // Use Puppeteer scrapers (original implementation)
    console.log('🌐 Using Puppeteer scrapers (LinkedIn, Indeed, Glassdoor)');
    console.log('⚠️ Note: These may fail due to anti-bot protection. Consider setting up Adzuna API.');
    
    const scrapePromises = [];

    if (sources.includes('LinkedIn')) {
      scrapePromises.push(
        scrapeLinkedIn(keyword, location)
          .then(jobs => allJobs.push(...jobs))
          .catch(error => errors.push({ source: 'LinkedIn', error: error.message }))
      );
    }

    if (sources.includes('Indeed')) {
      scrapePromises.push(
        scrapeIndeed(keyword, location)
          .then(jobs => allJobs.push(...jobs))
          .catch(error => errors.push({ source: 'Indeed', error: error.message }))
      );
    }

    if (sources.includes('Glassdoor')) {
      scrapePromises.push(
        scrapeGlassdoor(keyword, location)
          .then(jobs => allJobs.push(...jobs))
          .catch(error => errors.push({ source: 'Glassdoor', error: error.message }))
      );
    }

    await Promise.all(scrapePromises);
    
    // If all Puppeteer scrapers failed, fallback to mock
    if (allJobs.length === 0 && errors.length > 0) {
      console.log('⚠️ All Puppeteer scrapers failed. Falling back to mock scraper...');
      try {
        const mockJobs = await scrapeMockJobs(keyword, location);
        allJobs.push(...mockJobs);
      } catch (mockError: any) {
        console.error('Mock scraper fallback error:', mockError);
      }
    }
  }

  // Save jobs to database (avoid duplicates)
  const savedJobs = [];
  for (const job of allJobs) {
    try {
      const existingJob = await Job.findOne({ jobUrl: job.jobUrl });
      if (!existingJob) {
        // Add resumeId to the job data
        const jobData = resumeId ? { ...job, resumeId } : job;
        const newJob = await Job.create(jobData);
        savedJobs.push(newJob);
      } else {
        // Update existing job with resumeId if provided and not already set
        if (resumeId && !existingJob.resumeId) {
          existingJob.resumeId = resumeId as any;
          await existingJob.save();
        }
        savedJobs.push(existingJob);
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  }

  return {
    jobs: savedJobs,
    count: savedJobs.length,
    errors: errors.length > 0 ? errors : undefined
  };
};


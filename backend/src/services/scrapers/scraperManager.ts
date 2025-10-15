import { scrapeLinkedIn } from './linkedinScraper';
import { scrapeIndeed } from './indeedScraper';
import { scrapeGlassdoor } from './glassdoorScraper';
import Job from '../../models/Job';

interface ScrapeParams {
  keyword: string;
  location: string;
  sources?: ('LinkedIn' | 'Indeed' | 'Glassdoor')[];
}

export const scrapeJobs = async ({ keyword, location, sources = ['LinkedIn', 'Indeed', 'Glassdoor'] }: ScrapeParams) => {
  const allJobs: any[] = [];
  const errors: any[] = [];

  // Run scrapers in parallel with error handling
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

  // Save jobs to database (avoid duplicates)
  const savedJobs = [];
  for (const job of allJobs) {
    try {
      const existingJob = await Job.findOne({ jobUrl: job.jobUrl });
      if (!existingJob) {
        const newJob = await Job.create(job);
        savedJobs.push(newJob);
      } else {
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


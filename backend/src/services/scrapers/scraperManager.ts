import { scrapeMockJobs } from './mockScraper';
import { scrapeAdzuna } from './adzunaScraper';
import { scrapeArbeitnow } from './arbeitnowScraper';
import { scrapeJSearch } from './jsearchScraper';
import { deduplicateJobs } from './deduplicator';
import { extractLocationDetails } from './countryExtractor';
import Job from '../../models/Job';

interface ScrapeParams {
  keyword: string;
  location?: string; // Optional now - if not provided, fetches globally
  resumeId?: string;
  useCache?: boolean; // Enable cache for demo resumes
  userId?: string; // User ID to associate jobs with
}

interface JobListing {
  title: string;
  company: string;
  location: string;
  country?: string;
  description: string;
  salary?: string;
  jobUrl: string;
  source: string;
  postedDate?: Date;
}

// API Configuration - Auto-detect which APIs are configured
const USE_MOCK_SCRAPER = process.env.USE_MOCK_SCRAPER === 'true'; // Default to false (use real APIs)
const USE_ADZUNA_API = !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_API_KEY);
const USE_ARBEITNOW_API = process.env.USE_ARBEITNOW_API !== 'false'; // Default to true (no API key needed)
const USE_JSEARCH_API = !!(process.env.JSEARCH_API_KEY && process.env.USE_JSEARCH_API !== 'false');

// Cache configuration - can be customized via environment variable
const CACHE_TTL_HOURS = parseInt(process.env.JOB_CACHE_TTL_HOURS || '24', 10); // Default: Cache jobs for 24 hours

/**
 * Check if cached jobs exist for the given keyword and location
 * Returns cached jobs if they exist and are recent (within TTL)
 */
const getCachedJobs = async (keyword: string, location: string, userId?: string) => {
  const cacheExpiryTime = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000);
  
  // Find recent jobs for this keyword/location combination
  // Filter by userId if provided
  const query: any = {
    $or: [
      { title: new RegExp(keyword, 'i') },
      { description: new RegExp(keyword, 'i') }
    ],
    location: new RegExp(location, 'i'),
    scrapedDate: { $gte: cacheExpiryTime }
  };
  
  if (userId) {
    query.userId = userId;
  }
  
  const cachedJobs = await Job.find(query)
    .sort({ scrapedDate: -1 })
    .limit(50); // Limit to 50 jobs for performance

  if (cachedJobs.length > 0) {
    console.log(`💾 Found ${cachedJobs.length} cached jobs for "${keyword}" in "${location}"`);
    return cachedJobs;
  }

  return null;
};

/**
 * Clone cached jobs and associate them with a new resumeId
 */
const cloneCachedJobs = async (cachedJobs: any[], resumeId?: string, userId?: string) => {
  const clonedJobs = [];
  
  for (const job of cachedJobs) {
    try {
      // Check if this exact job URL is already associated with this resumeId and userId
      if (resumeId && userId) {
        const existingJob = await Job.findOne({ 
          jobUrl: job.jobUrl,
          resumeId,
          userId
        });
        
        if (existingJob) {
          clonedJobs.push(existingJob);
          continue;
        }
      }
      
      // Create a new job instance with the same data but new resumeId and userId
      const locationDetails = extractLocationDetails(job.location);
      const jobData: any = {
        title: job.title,
        company: job.company,
        location: job.location,
        country: job.country || locationDetails.country,
        region: job.region || locationDetails.region,
        description: job.description,
        salary: job.salary,
        jobUrl: job.jobUrl,
        source: job.source,
        postedDate: job.postedDate,
        scrapedDate: new Date(),
        saved: false,
        tags: job.tags || [],
        requirements: job.requirements || [],
        benefits: job.benefits || [],
        employmentType: job.employmentType,
        applicationDeadline: job.applicationDeadline,
        resumeId: resumeId
      };
      
      if (userId) {
        jobData.userId = userId;
      }
      
      // Try to find existing job with same URL for this user
      const query: any = { jobUrl: job.jobUrl };
      if (userId) {
        query.userId = userId;
      }
      const existingJob = await Job.findOne(query);
      
      if (existingJob) {
        // If job exists but without this resumeId, update it
        if (resumeId && (!existingJob.resumeId || existingJob.resumeId.toString() !== resumeId)) {
          existingJob.resumeId = resumeId as any;
          await existingJob.save();
        }
        clonedJobs.push(existingJob);
      } else {
        // Create new job
        const newJob = await Job.create(jobData);
        clonedJobs.push(newJob);
      }
    } catch (error) {
      console.error('Error cloning job:', error);
    }
  }
  
  return clonedJobs;
};

export const scrapeJobs = async ({ keyword, location = 'global', resumeId, useCache = true, userId }: ScrapeParams) => {
  const allJobs: JobListing[] = [];
  const errors: any[] = [];

  // If location is not provided or is 'global', fetch jobs globally
  const isGlobalSearch = !location || location.toLowerCase() === 'global' || location.toLowerCase() === 'worldwide' || location.toLowerCase() === 'anywhere';
  const searchLocation = isGlobalSearch ? 'global' : location;

  console.log(`🌍 Search mode: ${isGlobalSearch ? 'GLOBAL' : `Location-based (${searchLocation})`}`);

  // Check cache first if enabled
  if (useCache && !isGlobalSearch) {
    const cachedJobs = await getCachedJobs(keyword, searchLocation, userId);
    
    if (cachedJobs && cachedJobs.length > 0) {
      console.log('✨ Using cached jobs to save API resources');
      const clonedJobs = await cloneCachedJobs(cachedJobs, resumeId, userId);
      
      return {
        jobs: clonedJobs,
        count: clonedJobs.length,
        newCount: 0,
        existingCount: clonedJobs.length,
        usedCache: true,
        errors: undefined
      };
    }
    
    console.log('📥 No cached jobs found, fetching fresh data...');
  }

  // Check if using mock scraper
  if (USE_MOCK_SCRAPER) {
    console.log('🎭 Using MOCK scraper for testing (set USE_MOCK_SCRAPER=false to use real APIs)');
    
    try {
      const mockJobs = await scrapeMockJobs(keyword, searchLocation);
      allJobs.push(...mockJobs);
    } catch (error: any) {
      console.error('Mock scraper error:', error);
      errors.push({ source: 'Mock', error: error.message });
    }
  } else {
    // Multi-API mode: Run all enabled APIs in parallel
    console.log('🚀 Multi-API job search initiated...');
    
    const enabledApis: string[] = [];
    if (USE_ADZUNA_API && !isGlobalSearch) enabledApis.push('Adzuna'); // Adzuna requires specific location
    if (USE_ARBEITNOW_API) enabledApis.push('Arbeitnow');
    if (USE_JSEARCH_API) enabledApis.push('JSearch');
    
    console.log(`📡 Active APIs: ${enabledApis.join(', ') || 'None (will use fallback)'}`);
    
    // Build array of scraper promises
    const scraperPromises: Promise<JobListing[]>[] = [];
    
    // Adzuna requires a specific location, so we skip it for global searches
    if (USE_ADZUNA_API && !isGlobalSearch) {
      scraperPromises.push(
        scrapeAdzuna(keyword, searchLocation).catch((error: any) => {
          console.error('❌ Adzuna error:', error.message);
          errors.push({ source: 'Adzuna', error: error.message });
          return [];
        })
      );
    }
    
    if (USE_ARBEITNOW_API) {
      scraperPromises.push(
        scrapeArbeitnow(keyword, isGlobalSearch ? undefined : searchLocation).catch((error: any) => {
          console.error('❌ Arbeitnow error:', error.message);
          errors.push({ source: 'Arbeitnow', error: error.message });
          return [];
        })
      );
    }
    
    if (USE_JSEARCH_API) {
      scraperPromises.push(
        scrapeJSearch(keyword, isGlobalSearch ? undefined : searchLocation).catch((error: any) => {
          console.error('❌ JSearch error:', error.message);
          errors.push({ source: 'JSearch', error: error.message });
          return [];
        })
      );
    }
    
    // If no APIs are configured, warn the user
    if (scraperPromises.length === 0) {
      console.log('⚠️ No job APIs configured.');
      console.log('💡 Tip: Set up Adzuna, Arbeitnow, or JSearch API credentials in your .env file for job search');
      console.log('📝 Will fall back to mock scraper for testing...');
    }
    
    // Execute all scrapers in parallel
    console.log(`⏳ Running ${scraperPromises.length} scrapers in parallel...`);
    const results = await Promise.all(scraperPromises);
    
    // Flatten results
    for (const jobList of results) {
      allJobs.push(...jobList);
    }
    
    console.log(`📦 Collected ${allJobs.length} total jobs before deduplication`);
    
    // Deduplicate jobs from multiple sources
    if (allJobs.length > 0) {
      const deduplicationResult = deduplicateJobs(allJobs);
      allJobs.length = 0; // Clear array
      allJobs.push(...deduplicationResult.uniqueJobs);
      
      console.log(`✨ After deduplication: ${allJobs.length} unique jobs`);
    }
    
    // Fallback to mock if all APIs failed
    if (allJobs.length === 0 && errors.length > 0) {
      console.log('⚠️ All scrapers failed or returned no results. Falling back to mock scraper...');
      try {
        const mockJobs = await scrapeMockJobs(keyword, searchLocation);
        allJobs.push(...mockJobs);
      } catch (mockError: any) {
        console.error('Mock scraper fallback error:', mockError);
        errors.push({ source: 'Mock Fallback', error: mockError.message });
      }
    }
  }

  // Save jobs to database (avoid duplicates)
  const savedJobs = [];
  let newJobsCount = 0;
  let existingJobsCount = 0;
  
  for (const job of allJobs) {
    try {
      // Find existing job with same URL for this user
      const query: any = { jobUrl: job.jobUrl };
      if (userId) {
        query.userId = userId;
      }
      const existingJob = await Job.findOne(query);
      
      if (!existingJob) {
        // Extract country and region from location and add to job data
        const locationDetails = extractLocationDetails(job.location);
        const jobData: any = {
          ...job,
          country: locationDetails.country,
          region: locationDetails.region,
          ...(resumeId && { resumeId }),
          ...(userId && { userId })
        };
        const newJob = await Job.create(jobData);
        savedJobs.push(newJob);
        newJobsCount++;
      } else {
        // Update existing job with resumeId, country, and region if provided
        if (resumeId) {
          existingJob.resumeId = resumeId as any;
        }
        // Update country and region if they're not set or are 'Unknown'
        const locationDetails = extractLocationDetails(job.location);
        if (!existingJob.country || existingJob.country === 'Unknown') {
          existingJob.country = locationDetails.country;
        }
        if (!existingJob.region && locationDetails.region) {
          existingJob.region = locationDetails.region;
        }
        await existingJob.save();
        savedJobs.push(existingJob);
        existingJobsCount++;
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  }

  console.log(`📊 Job Summary: ${newJobsCount} new, ${existingJobsCount} existing, ${savedJobs.length} total saved`);

  return {
    jobs: savedJobs,
    count: savedJobs.length,
    newCount: newJobsCount,
    existingCount: existingJobsCount,
    usedCache: false,
    errors: errors.length > 0 ? errors : undefined
  };
};


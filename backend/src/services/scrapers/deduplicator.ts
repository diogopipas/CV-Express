interface JobListing {
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  jobUrl: string;
  source: string;
  postedDate?: Date;
}

interface DeduplicationResult {
  uniqueJobs: JobListing[];
  duplicatesRemoved: number;
  bySource: { [source: string]: number };
}

/**
 * Deduplicate jobs from multiple API sources
 * Priority order when merging duplicates:
 * 1. Most complete job data (has salary, description, etc.)
 * 2. Most recent posted date
 * 3. Source priority: Adzuna > JSearch > Arbeitnow
 */
export const deduplicateJobs = (jobs: JobListing[]): DeduplicationResult => {
  if (jobs.length === 0) {
    return { uniqueJobs: [], duplicatesRemoved: 0, bySource: {} };
  }

  console.log(`🔍 Deduplicating ${jobs.length} jobs from multiple sources...`);

  const uniqueJobsMap = new Map<string, JobListing>();
  const urlMap = new Map<string, JobListing>();
  let duplicatesRemoved = 0;

  // Track jobs by source
  const sourceCount: { [source: string]: number } = {};
  jobs.forEach(job => {
    sourceCount[job.source] = (sourceCount[job.source] || 0) + 1;
  });

  console.log('📊 Jobs by source:', sourceCount);

  // First pass: Group by exact URL (highest confidence duplicates)
  for (const job of jobs) {
    const normalizedUrl = normalizeUrl(job.jobUrl);
    
    if (urlMap.has(normalizedUrl)) {
      // Duplicate found - merge with better data
      const existing = urlMap.get(normalizedUrl)!;
      const merged = mergeJobs(existing, job);
      urlMap.set(normalizedUrl, merged);
      duplicatesRemoved++;
    } else {
      urlMap.set(normalizedUrl, job);
    }
  }

  console.log(`📌 After URL deduplication: ${urlMap.size} unique URLs (removed ${duplicatesRemoved} duplicates)`);

  // Second pass: Find similar jobs (company + title + location)
  const jobsAfterUrlDedup = Array.from(urlMap.values());
  
  for (const job of jobsAfterUrlDedup) {
    const similarityKey = generateSimilarityKey(job);
    
    if (uniqueJobsMap.has(similarityKey)) {
      // Similar job found - keep the better one
      const existing = uniqueJobsMap.get(similarityKey)!;
      
      // Only merge if jobs are truly similar (not just same company)
      if (areSimilarJobs(existing, job)) {
        const merged = mergeJobs(existing, job);
        uniqueJobsMap.set(similarityKey, merged);
        duplicatesRemoved++;
      } else {
        // Not similar enough - keep both with modified key
        const uniqueKey = `${similarityKey}_${uniqueJobsMap.size}`;
        uniqueJobsMap.set(uniqueKey, job);
      }
    } else {
      uniqueJobsMap.set(similarityKey, job);
    }
  }

  const uniqueJobs = Array.from(uniqueJobsMap.values());
  
  console.log(`✅ Deduplication complete: ${uniqueJobs.length} unique jobs (removed ${duplicatesRemoved} duplicates)`);
  
  // Count final distribution by source
  const finalBySource: { [source: string]: number } = {};
  uniqueJobs.forEach(job => {
    finalBySource[job.source] = (finalBySource[job.source] || 0) + 1;
  });
  
  console.log('📊 Final distribution:', finalBySource);

  return {
    uniqueJobs,
    duplicatesRemoved,
    bySource: finalBySource
  };
};

/**
 * Normalize URL for comparison (remove tracking params, etc.)
 */
const normalizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    
    // Remove common tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'source', 'via'];
    trackingParams.forEach(param => urlObj.searchParams.delete(param));
    
    // Return normalized URL
    return urlObj.href.toLowerCase();
  } catch {
    // If URL parsing fails, return lowercase original
    return url.toLowerCase();
  }
};

/**
 * Generate a similarity key for fuzzy matching
 */
const generateSimilarityKey = (job: JobListing): string => {
  const company = normalizeString(job.company);
  const title = normalizeString(job.title);
  const location = normalizeString(job.location);
  
  return `${company}|${title}|${location}`;
};

/**
 * Normalize string for comparison (lowercase, remove special chars, etc.)
 */
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

/**
 * Check if two jobs are similar enough to be considered duplicates
 */
const areSimilarJobs = (job1: JobListing, job2: JobListing): boolean => {
  // Calculate title similarity
  const titleSimilarity = calculateStringSimilarity(
    normalizeString(job1.title),
    normalizeString(job2.title)
  );
  
  // Calculate company similarity
  const companySimilarity = calculateStringSimilarity(
    normalizeString(job1.company),
    normalizeString(job2.company)
  );
  
  // Jobs are similar if:
  // - Same company (100% match) AND title similarity > 70%
  // - OR both company and title similarity > 80%
  if (companySimilarity === 1 && titleSimilarity >= 0.7) {
    return true;
  }
  
  if (companySimilarity >= 0.8 && titleSimilarity >= 0.8) {
    return true;
  }
  
  return false;
};

/**
 * Calculate string similarity using Jaccard similarity
 */
const calculateStringSimilarity = (str1: string, str2: string): number => {
  const words1 = new Set(str1.split(' '));
  const words2 = new Set(str2.split(' '));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  if (union.size === 0) return 0;
  
  return intersection.size / union.size;
};

/**
 * Merge two duplicate jobs, keeping the best data from each
 */
const mergeJobs = (job1: JobListing, job2: JobListing): JobListing => {
  // Source priority: Adzuna > JSearch > Arbeitnow
  const sourcePriority: { [key: string]: number } = {
    'Adzuna': 3,
    'JSearch': 2,
    'Arbeitnow': 1
  };
  
  const priority1 = sourcePriority[job1.source] || 0;
  const priority2 = sourcePriority[job2.source] || 0;
  
  // Calculate completeness score
  const score1 = calculateCompletenessScore(job1);
  const score2 = calculateCompletenessScore(job2);
  
  // Prefer the job with higher completeness, then by source priority
  const preferJob1 = score1 > score2 || (score1 === score2 && priority1 >= priority2);
  const primary = preferJob1 ? job1 : job2;
  const secondary = preferJob1 ? job2 : job1;
  
  // Merge data, preferring primary but filling gaps with secondary
  return {
    title: primary.title || secondary.title,
    company: primary.company || secondary.company,
    location: primary.location || secondary.location,
    description: (primary.description?.length || 0) > (secondary.description?.length || 0) 
      ? primary.description 
      : secondary.description,
    salary: primary.salary || secondary.salary,
    jobUrl: primary.jobUrl || secondary.jobUrl,
    source: primary.source, // Keep primary source
    postedDate: getMostRecentDate(primary.postedDate, secondary.postedDate)
  };
};

/**
 * Calculate completeness score for a job listing
 */
const calculateCompletenessScore = (job: JobListing): number => {
  let score = 0;
  
  if (job.title && job.title.length > 5) score += 1;
  if (job.company && job.company !== 'Unknown Company') score += 1;
  if (job.location && job.location.length > 2) score += 1;
  if (job.description && job.description.length > 50) score += 2;
  if (job.salary) score += 2;
  if (job.postedDate) score += 1;
  
  return score;
};

/**
 * Get the most recent date from two dates
 */
const getMostRecentDate = (date1?: Date, date2?: Date): Date | undefined => {
  if (!date1 && !date2) return undefined;
  if (!date1) return date2;
  if (!date2) return date1;
  
  return date1 > date2 ? date1 : date2;
};


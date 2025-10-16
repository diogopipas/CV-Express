import axios from 'axios';

interface JobListing {
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  jobUrl: string;
  source: 'Adzuna';
  postedDate?: Date;
}

interface AdzunaJob {
  id: string;
  title: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
    area: string[];
  };
  description: string;
  salary_min?: number;
  salary_max?: number;
  redirect_url: string;
  created: string;
  contract_time?: string;
  contract_type?: string;
}

interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
  mean?: number;
}

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;
const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

export const scrapeAdzuna = async (keyword: string, location: string): Promise<JobListing[]> => {
  const jobs: JobListing[] = [];

  // Validate API credentials
  if (!ADZUNA_APP_ID || !ADZUNA_API_KEY) {
    console.error('Adzuna API credentials not found. Please set ADZUNA_APP_ID and ADZUNA_API_KEY in .env file');
    throw new Error('Adzuna API credentials not configured');
  }

  try {
    // Determine country code from location (default to US)
    const country = getCountryCode(location);
    
    // Build API URL
    const url = `${ADZUNA_BASE_URL}/${country}/search/1`;
    
    console.log(`Fetching jobs from Adzuna API for "${keyword}" in "${location}"...`);
    
    // Make API request
    const response = await axios.get<AdzunaResponse>(url, {
      params: {
        app_id: ADZUNA_APP_ID,
        app_key: ADZUNA_API_KEY,
        results_per_page: 50,
        what: keyword,
        where: location,
        sort_by: 'date' // Most recent first
      },
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const adzunaJobs = response.data.results || [];
    
    console.log(`Adzuna API returned ${adzunaJobs.length} jobs`);

    // Transform Adzuna jobs to our format
    for (const job of adzunaJobs) {
      const salary = formatSalary(job.salary_min, job.salary_max);
      
      jobs.push({
        title: job.title,
        company: job.company?.display_name || 'Unknown Company',
        location: job.location?.display_name || location,
        description: stripHtml(job.description),
        salary: salary,
        jobUrl: job.redirect_url,
        source: 'Adzuna',
        postedDate: job.created ? new Date(job.created) : undefined
      });
    }

    return jobs;
  } catch (error: any) {
    if (error.response) {
      // API returned an error response
      console.error('Adzuna API error:', error.response.status, error.response.data);
      
      if (error.response.status === 401 || error.response.status === 403) {
        throw new Error('Invalid Adzuna API credentials. Please check your APP_ID and API_KEY');
      } else if (error.response.status === 429) {
        throw new Error('Adzuna API rate limit exceeded. Please try again later');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Adzuna API no response:', error.message);
      throw new Error('Failed to connect to Adzuna API');
    } else {
      // Error in request setup
      console.error('Adzuna API request error:', error.message);
    }
    
    throw error;
  }
};

// Helper function to determine country code from location
const getCountryCode = (location: string): string => {
  const locationLower = location.toLowerCase();
  
  if (locationLower.includes('uk') || locationLower.includes('united kingdom') || locationLower.includes('london') || locationLower.includes('manchester')) {
    return 'gb';
  } else if (locationLower.includes('canada') || locationLower.includes('toronto') || locationLower.includes('vancouver')) {
    return 'ca';
  } else if (locationLower.includes('australia') || locationLower.includes('sydney') || locationLower.includes('melbourne')) {
    return 'au';
  } else if (locationLower.includes('india') || locationLower.includes('bangalore') || locationLower.includes('mumbai')) {
    return 'in';
  } else if (locationLower.includes('germany') || locationLower.includes('berlin') || locationLower.includes('munich')) {
    return 'de';
  } else if (locationLower.includes('france') || locationLower.includes('paris')) {
    return 'fr';
  }
  
  // Default to US
  return 'us';
};

// Helper function to format salary
const formatSalary = (min?: number, max?: number): string | undefined => {
  if (!min && !max) return undefined;
  
  if (min && max) {
    return `$${Math.round(min).toLocaleString()} - $${Math.round(max).toLocaleString()}`;
  } else if (min) {
    return `From $${Math.round(min).toLocaleString()}`;
  } else if (max) {
    return `Up to $${Math.round(max).toLocaleString()}`;
  }
  
  return undefined;
};

// Helper function to strip HTML tags from description
const stripHtml = (html: string): string => {
  if (!html) return '';
  
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, ' ');
  
  // Replace common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  // Limit description length
  if (text.length > 500) {
    text = text.substring(0, 500) + '...';
  }
  
  return text;
};


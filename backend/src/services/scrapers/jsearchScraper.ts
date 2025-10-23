import axios from 'axios';

interface JobListing {
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  jobUrl: string;
  source: 'JSearch';
  postedDate?: Date;
}

interface JSearchJob {
  job_id: string;
  employer_name: string;
  employer_logo?: string;
  employer_website?: string;
  job_employment_type: string;
  job_title: string;
  job_apply_link: string;
  job_description: string;
  job_is_remote: boolean;
  job_posted_at_timestamp?: number;
  job_posted_at_datetime_utc?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_latitude?: number;
  job_longitude?: number;
  job_benefits?: string[];
  job_google_link?: string;
  job_offer_expiration_datetime_utc?: string;
  job_offer_expiration_timestamp?: number;
  job_required_experience?: {
    no_experience_required?: boolean;
    required_experience_in_months?: number;
    experience_mentioned?: boolean;
    experience_preferred?: boolean;
  };
  job_required_skills?: string[];
  job_required_education?: {
    postgraduate_degree?: boolean;
    professional_degree?: boolean;
    high_school?: boolean;
    associates_degree?: boolean;
    bachelors_degree?: boolean;
    degree_mentioned?: boolean;
    degree_preferred?: boolean;
    professional_degree_mentioned?: boolean;
  };
  job_experience_in_place_of_education?: boolean;
  job_min_salary?: number;
  job_max_salary?: number;
  job_salary_currency?: string;
  job_salary_period?: string;
  job_highlights?: {
    Qualifications?: string[];
    Responsibilities?: string[];
    Benefits?: string[];
  };
  job_job_title?: string;
  job_posting_language?: string;
  job_onet_soc?: string;
  job_onet_job_zone?: string;
}

interface JSearchResponse {
  status: string;
  request_id: string;
  parameters: {
    query: string;
    page: number;
    num_pages: number;
  };
  data: JSearchJob[];
}

const JSEARCH_BASE_URL = 'https://jsearch.p.rapidapi.com/search';
const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY;
const REQUEST_TIMEOUT = 30000; // 30 seconds
const RESULTS_PER_PAGE = 20; // JSearch default
const MAX_PAGES_PER_REQUEST = 30; // API limit per request
const TOTAL_PAGES_TO_FETCH = 50; // Total pages to fetch (500 jobs)

export const scrapeJSearch = async (keyword: string, location: string): Promise<JobListing[]> => {
  const jobs: JobListing[] = [];

  // Validate API key
  if (!JSEARCH_API_KEY) {
    console.warn('⚠️ JSearch API key not found. Skipping JSearch scraper.');
    return jobs;
  }

  try {
    console.log(`Fetching jobs from JSearch API for "${keyword}" in "${location}"...`);
    
    // Build search query
    const query = `${keyword} in ${location}`;
    
    // Calculate number of requests needed
    const numRequests = Math.ceil(TOTAL_PAGES_TO_FETCH / MAX_PAGES_PER_REQUEST);
    console.log(`📄 JSearch: Making ${numRequests} API requests to fetch ${TOTAL_PAGES_TO_FETCH} pages...`);
    
    let allJobs: JSearchJob[] = [];
    
    // Make multiple API requests to fetch all pages
    for (let requestNum = 0; requestNum < numRequests; requestNum++) {
      const startPage = requestNum * MAX_PAGES_PER_REQUEST + 1;
      const pagesThisRequest = Math.min(MAX_PAGES_PER_REQUEST, TOTAL_PAGES_TO_FETCH - requestNum * MAX_PAGES_PER_REQUEST);
      
      try {
        console.log(`📄 JSearch: Fetching pages ${startPage}-${startPage + pagesThisRequest - 1}...`);
        
        const response = await axios.get<JSearchResponse>(JSEARCH_BASE_URL, {
          params: {
            query: query,
            page: startPage.toString(),
            num_pages: pagesThisRequest.toString(),
            date_posted: 'all'
          },
          headers: {
            'X-RapidAPI-Key': JSEARCH_API_KEY,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
            'Content-Type': 'application/json'
          },
          timeout: REQUEST_TIMEOUT
        });

        const jsearchJobs = response.data.data || [];
        allJobs = allJobs.concat(jsearchJobs);
        console.log(`✅ JSearch: Received ${jsearchJobs.length} jobs from this batch (total: ${allJobs.length})`);
        
        // If we got fewer results than expected, stop making more requests
        if (jsearchJobs.length < pagesThisRequest * RESULTS_PER_PAGE) {
          console.log(`📄 JSearch: Reached end of available results`);
          break;
        }
        
        // Add a small delay between requests to avoid rate limiting
        if (requestNum < numRequests - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (batchError: any) {
        console.error(`⚠️ JSearch: Error fetching batch ${requestNum + 1}:`, batchError.message);
        // Continue with what we have so far
        break;
      }
    }

    console.log(`📄 JSearch API: Received ${allJobs.length} total jobs`);

    // Transform JSearch jobs to our format
    for (const job of allJobs) {
      const salary = formatSalary(
        job.job_min_salary,
        job.job_max_salary,
        job.job_salary_currency,
        job.job_salary_period
      );
      
      const location = buildLocation(job.job_city, job.job_state, job.job_country, job.job_is_remote);
      
      jobs.push({
        title: job.job_title,
        company: job.employer_name || 'Unknown Company',
        location: location,
        description: truncateDescription(job.job_description),
        salary: salary,
        jobUrl: job.job_apply_link,
        source: 'JSearch',
        postedDate: job.job_posted_at_timestamp 
          ? new Date(job.job_posted_at_timestamp * 1000) 
          : undefined
      });
    }

    console.log(`✅ JSearch API: Completed - ${jobs.length} jobs`);
    return jobs;
  } catch (error: any) {
    if (error.response) {
      console.error('JSearch API error:', error.response.status, error.response.data);
      
      if (error.response.status === 401 || error.response.status === 403) {
        throw new Error('Invalid JSearch API key. Please check your JSEARCH_API_KEY');
      } else if (error.response.status === 429) {
        throw new Error('JSearch API rate limit exceeded. Please try again later');
      }
    } else if (error.request) {
      console.error('JSearch API no response:', error.message);
      throw new Error('Failed to connect to JSearch API');
    } else {
      console.error('JSearch API request error:', error.message);
    }
    
    throw error;
  }
};

// Helper function to build location string
const buildLocation = (city?: string, state?: string, country?: string, isRemote?: boolean): string => {
  if (isRemote) {
    return 'Remote';
  }
  
  const parts = [city, state, country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Not specified';
};

// Helper function to format salary
const formatSalary = (
  min?: number, 
  max?: number, 
  currency?: string, 
  period?: string
): string | undefined => {
  if (!min && !max) return undefined;
  
  const currencySymbol = getCurrencySymbol(currency);
  const periodText = period ? ` ${period}` : '';
  
  if (min && max) {
    return `${currencySymbol}${Math.round(min).toLocaleString()} - ${currencySymbol}${Math.round(max).toLocaleString()}${periodText}`;
  } else if (min) {
    return `From ${currencySymbol}${Math.round(min).toLocaleString()}${periodText}`;
  } else if (max) {
    return `Up to ${currencySymbol}${Math.round(max).toLocaleString()}${periodText}`;
  }
  
  return undefined;
};

// Helper function to get currency symbol
const getCurrencySymbol = (currency?: string): string => {
  const symbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF ',
    'CNY': '¥',
    'INR': '₹',
    'BRL': 'R$',
    'MXN': 'MX$'
  };
  
  return symbols[currency?.toUpperCase() || ''] || '$';
};

// Helper function to truncate description
const truncateDescription = (description: string): string => {
  if (!description) return 'No description available';
  
  // Remove extra whitespace
  let text = description.replace(/\s+/g, ' ').trim();
  
  // Limit description length
  if (text.length > 500) {
    text = text.substring(0, 500) + '...';
  }
  
  return text;
};


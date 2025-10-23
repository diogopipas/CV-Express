import axios from 'axios';

interface JobListing {
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  jobUrl: string;
  source: 'Arbeitnow';
  postedDate?: Date;
}

interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: number;
}

interface ArbeitnowResponse {
  data: ArbeitnowJob[];
}

const ARBEITNOW_BASE_URL = 'https://www.arbeitnow.com/api/job-board-api';
const REQUEST_TIMEOUT = 15000; // 15 seconds

export const scrapeArbeitnow = async (keyword: string, location: string): Promise<JobListing[]> => {
  const jobs: JobListing[] = [];

  try {
    console.log(`Fetching jobs from Arbeitnow API for "${keyword}" in "${location}"...`);
    
    // Arbeitnow API doesn't require authentication
    const response = await axios.get<ArbeitnowResponse>(ARBEITNOW_BASE_URL, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const arbeitnowJobs = response.data.data || [];
    console.log(`📄 Arbeitnow API: Received ${arbeitnowJobs.length} total jobs`);

    // Filter jobs based on keyword and location
    const filteredJobs = filterJobs(arbeitnowJobs, keyword, location);
    console.log(`🔍 Filtered to ${filteredJobs.length} relevant jobs`);

    // Transform Arbeitnow jobs to our format
    for (const job of filteredJobs) {
      jobs.push({
        title: job.title,
        company: job.company_name || 'Unknown Company',
        location: job.location || (job.remote ? 'Remote' : location),
        description: job.description || 'No description available',
        salary: undefined, // Arbeitnow doesn't provide salary in API
        jobUrl: job.url,
        source: 'Arbeitnow',
        postedDate: job.created_at ? new Date(job.created_at * 1000) : undefined
      });
    }

    console.log(`✅ Arbeitnow API: Completed - ${jobs.length} jobs`);
    return jobs;
  } catch (error: any) {
    if (error.response) {
      console.error('Arbeitnow API error:', error.response.status, error.response.data);
      
      if (error.response.status === 429) {
        throw new Error('Arbeitnow API rate limit exceeded. Please try again later');
      }
    } else if (error.request) {
      console.error('Arbeitnow API no response:', error.message);
      throw new Error('Failed to connect to Arbeitnow API');
    } else {
      console.error('Arbeitnow API request error:', error.message);
    }
    
    throw error;
  }
};

// Helper function to filter jobs based on keyword and location
const filterJobs = (jobs: ArbeitnowJob[], keyword: string, location: string): ArbeitnowJob[] => {
  const keywordLower = keyword.toLowerCase();
  const locationLower = location.toLowerCase();
  
  // Split keyword into individual terms for more flexible matching
  const keywordTerms = keywordLower.split(/\s+/).filter(term => term.length > 2);
  
  return jobs.filter(job => {
    // More flexible keyword matching: match if ANY keyword term appears in title, description, or tags
    const titleLower = job.title.toLowerCase();
    const descriptionLower = job.description.toLowerCase();
    const tagsLower = job.tags.map(tag => tag.toLowerCase());
    
    // If keyword is a single word or phrase, use original logic
    let keywordMatches = false;
    if (keywordTerms.length === 0 || keyword.length <= 3) {
      // For short keywords, use exact match
      keywordMatches = true; // Include all jobs if keyword is too short
    } else if (keywordTerms.length === 1) {
      // Single term: match if it appears anywhere
      keywordMatches = titleLower.includes(keywordLower) || 
                      descriptionLower.includes(keywordLower) ||
                      tagsLower.some(tag => tag.includes(keywordLower));
    } else {
      // Multiple terms: match if at least one term appears in title or at least 2 terms appear overall
      const titleMatchCount = keywordTerms.filter(term => titleLower.includes(term)).length;
      const descMatchCount = keywordTerms.filter(term => descriptionLower.includes(term)).length;
      const tagMatchCount = keywordTerms.filter(term => 
        tagsLower.some(tag => tag.includes(term))
      ).length;
      
      const totalMatches = titleMatchCount + descMatchCount + tagMatchCount;
      
      // Match if: title has any term OR at least 25% of terms match overall (reduced from 40%)
      keywordMatches = titleMatchCount > 0 || totalMatches >= Math.max(1, Math.ceil(keywordTerms.length * 0.25));
    }
    
    // Check if location matches (very lenient: include remote jobs and broad matches)
    const jobLocationLower = job.location.toLowerCase();
    const locationMatches = 
      job.remote || // Include all remote jobs
      location.toLowerCase() === 'remote' || // If searching for remote, include all remote jobs
      locationLower.length < 3 || // If location is too short, include all
      locationLower === 'anywhere' || // If searching anywhere, include all
      jobLocationLower.includes(locationLower) ||
      locationLower.includes(jobLocationLower) || // Also match if search location contains job location
      isLocationInCountry(jobLocationLower, locationLower);
    
    return keywordMatches && locationMatches;
  });
};

// Helper function to check if job location is in the requested country
const isLocationInCountry = (jobLocation: string, requestedLocation: string): boolean => {
  const locationLower = requestedLocation.toLowerCase();
  const jobLocationLower = jobLocation.toLowerCase();
  
  // European countries mapping
  const countryMappings: { [key: string]: string[] } = {
    'portugal': ['portugal', 'pt', 'lisbon', 'lisboa', 'porto', 'braga', 'coimbra', 'faro', 'aveiro'],
    'spain': ['spain', 'españa', 'es', 'madrid', 'barcelona', 'valencia', 'seville', 'sevilla', 'bilbao'],
    'germany': ['germany', 'deutschland', 'de', 'berlin', 'munich', 'münchen', 'hamburg', 'cologne', 'frankfurt'],
    'france': ['france', 'fr', 'paris', 'lyon', 'marseille', 'toulouse', 'nice', 'nantes'],
    'italy': ['italy', 'italia', 'it', 'rome', 'roma', 'milan', 'milano', 'naples', 'turin'],
    'netherlands': ['netherlands', 'holland', 'nl', 'amsterdam', 'rotterdam', 'the hague', 'utrecht'],
    'poland': ['poland', 'polska', 'pl', 'warsaw', 'warszawa', 'krakow', 'kraków', 'wroclaw'],
    'austria': ['austria', 'österreich', 'at', 'vienna', 'wien', 'salzburg', 'graz'],
    'belgium': ['belgium', 'belgique', 'belgië', 'be', 'brussels', 'bruxelles', 'antwerp'],
    'switzerland': ['switzerland', 'schweiz', 'suisse', 'ch', 'zurich', 'zürich', 'geneva', 'basel'],
    'sweden': ['sweden', 'sverige', 'se', 'stockholm', 'gothenburg', 'göteborg', 'malmö'],
    'denmark': ['denmark', 'danmark', 'dk', 'copenhagen', 'københavn', 'aarhus'],
    'norway': ['norway', 'norge', 'no', 'oslo', 'bergen', 'trondheim'],
    'finland': ['finland', 'suomi', 'fi', 'helsinki', 'tampere', 'turku'],
    'czech republic': ['czech', 'czechia', 'cz', 'prague', 'praha', 'brno'],
    'ireland': ['ireland', 'éire', 'ie', 'dublin', 'cork', 'galway'],
    'uk': ['uk', 'united kingdom', 'gb', 'london', 'manchester', 'birmingham', 'edinburgh']
  };
  
  // Check each country mapping
  for (const [country, keywords] of Object.entries(countryMappings)) {
    const locationMatchesCountry = keywords.some(kw => locationLower.includes(kw));
    const jobLocationMatchesCountry = keywords.some(kw => jobLocationLower.includes(kw));
    
    if (locationMatchesCountry && jobLocationMatchesCountry) {
      return true;
    }
  }
  
  return false;
};


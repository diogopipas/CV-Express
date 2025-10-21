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
const ADZUNA_MAX_PAGES = parseInt(process.env.ADZUNA_MAX_PAGES || '5', 10);
const RESULTS_PER_PAGE = 50;
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second delay to avoid rate limiting

// Helper function to add delay between requests
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const scrapeAdzuna = async (keyword: string, location: string): Promise<JobListing[]> => {
  const jobs: JobListing[] = [];

  // Validate API credentials
  if (!ADZUNA_APP_ID || !ADZUNA_API_KEY) {
    console.error('Adzuna API credentials not found. Please set ADZUNA_APP_ID and ADZUNA_API_KEY in .env file');
    throw new Error('Adzuna API credentials not configured');
  }

  try {
    // Determine country code from location (default to GB)
    const country = getCountryCode(location);
    
    console.log(`Fetching jobs from Adzuna API for "${keyword}" in "${location}"...`);
    console.log(`🌍 Detected country code: ${country.toUpperCase()}`);
    console.log(`📄 Fetching up to ${ADZUNA_MAX_PAGES} pages (max ${ADZUNA_MAX_PAGES * RESULTS_PER_PAGE} jobs)...`);
    
    let totalJobsFetched = 0;
    let pagesProcessed = 0;
    
    // Loop through pages
    for (let page = 1; page <= ADZUNA_MAX_PAGES; page++) {
      try {
        // Build API URL with current page
        const url = `${ADZUNA_BASE_URL}/${country}/search/${page}`;
        
        // Make API request
        const response = await axios.get<AdzunaResponse>(url, {
          params: {
            app_id: ADZUNA_APP_ID,
            app_key: ADZUNA_API_KEY,
            results_per_page: RESULTS_PER_PAGE,
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
        pagesProcessed++;
        totalJobsFetched += adzunaJobs.length;
        
        console.log(`📄 Page ${page}/${ADZUNA_MAX_PAGES}: Received ${adzunaJobs.length} jobs`);

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

        // If we received fewer results than requested, we've reached the end
        if (adzunaJobs.length < RESULTS_PER_PAGE) {
          console.log(`✅ Reached end of results at page ${page}`);
          break;
        }

        // Add delay between requests (except after the last page)
        if (page < ADZUNA_MAX_PAGES) {
          await sleep(DELAY_BETWEEN_REQUESTS);
        }
      } catch (pageError: any) {
        // Handle rate limiting
        if (pageError.response?.status === 429) {
          console.error(`⚠️ Rate limit reached at page ${page}. Stopping pagination.`);
          break;
        }
        
        // Log error but continue with what we have
        console.error(`⚠️ Error fetching page ${page}:`, pageError.message);
        
        // If first page fails, throw error; otherwise continue
        if (page === 1) {
          throw pageError;
        }
        break;
      }
    }

    console.log(`✅ Adzuna API: Completed - ${totalJobsFetched} jobs from ${pagesProcessed} ${pagesProcessed === 1 ? 'page' : 'pages'}`);

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
  
  // Portugal 🇵🇹
  if (locationLower.includes('portugal') || locationLower.includes('lisbon') || locationLower.includes('lisboa') || 
      locationLower.includes('porto') || locationLower.includes('braga') || locationLower.includes('coimbra') ||
      locationLower.includes('faro') || locationLower.includes('aveiro')) {
    return 'pt';
  }
  
  // Spain 🇪🇸
  if (locationLower.includes('spain') || locationLower.includes('españa') || locationLower.includes('madrid') || 
      locationLower.includes('barcelona') || locationLower.includes('valencia') || locationLower.includes('seville') ||
      locationLower.includes('sevilla') || locationLower.includes('bilbao') || locationLower.includes('malaga')) {
    return 'es';
  }
  
  // Brazil 🇧🇷
  if (locationLower.includes('brazil') || locationLower.includes('brasil') || locationLower.includes('são paulo') ||
      locationLower.includes('sao paulo') || locationLower.includes('rio de janeiro') || locationLower.includes('brasília') ||
      locationLower.includes('brasilia') || locationLower.includes('belo horizonte') || locationLower.includes('curitiba')) {
    return 'br';
  }
  
  // United Kingdom 🇬🇧
  if (locationLower.includes('uk') || locationLower.includes('united kingdom') || locationLower.includes('london') || 
      locationLower.includes('manchester') || locationLower.includes('birmingham') || locationLower.includes('edinburgh') ||
      locationLower.includes('glasgow') || locationLower.includes('liverpool') || locationLower.includes('bristol')) {
    return 'gb';
  }
  
  // Germany 🇩🇪
  if (locationLower.includes('germany') || locationLower.includes('deutschland') || locationLower.includes('berlin') || 
      locationLower.includes('munich') || locationLower.includes('münchen') || locationLower.includes('hamburg') ||
      locationLower.includes('cologne') || locationLower.includes('köln') || locationLower.includes('frankfurt')) {
    return 'de';
  }
  
  // France 🇫🇷
  if (locationLower.includes('france') || locationLower.includes('paris') || locationLower.includes('lyon') ||
      locationLower.includes('marseille') || locationLower.includes('toulouse') || locationLower.includes('nice') ||
      locationLower.includes('nantes') || locationLower.includes('strasbourg')) {
    return 'fr';
  }
  
  // Italy 🇮🇹
  if (locationLower.includes('italy') || locationLower.includes('italia') || locationLower.includes('rome') || 
      locationLower.includes('roma') || locationLower.includes('milan') || locationLower.includes('milano') ||
      locationLower.includes('naples') || locationLower.includes('napoli') || locationLower.includes('turin') ||
      locationLower.includes('torino') || locationLower.includes('florence') || locationLower.includes('firenze')) {
    return 'it';
  }
  
  // Netherlands 🇳🇱
  if (locationLower.includes('netherlands') || locationLower.includes('holland') || locationLower.includes('amsterdam') ||
      locationLower.includes('rotterdam') || locationLower.includes('the hague') || locationLower.includes('utrecht') ||
      locationLower.includes('eindhoven')) {
    return 'nl';
  }
  
  // Poland 🇵🇱
  if (locationLower.includes('poland') || locationLower.includes('polska') || locationLower.includes('warsaw') ||
      locationLower.includes('warszawa') || locationLower.includes('krakow') || locationLower.includes('kraków') ||
      locationLower.includes('wroclaw') || locationLower.includes('wrocław') || locationLower.includes('gdansk')) {
    return 'pl';
  }
  
  // Austria 🇦🇹
  if (locationLower.includes('austria') || locationLower.includes('österreich') || locationLower.includes('vienna') ||
      locationLower.includes('wien') || locationLower.includes('salzburg') || locationLower.includes('graz') ||
      locationLower.includes('innsbruck')) {
    return 'at';
  }
  
  // Belgium 🇧🇪
  if (locationLower.includes('belgium') || locationLower.includes('belgique') || locationLower.includes('belgië') ||
      locationLower.includes('brussels') || locationLower.includes('bruxelles') || locationLower.includes('antwerp') ||
      locationLower.includes('antwerpen') || locationLower.includes('ghent') || locationLower.includes('bruges')) {
    return 'be';
  }
  
  // Switzerland 🇨🇭
  if (locationLower.includes('switzerland') || locationLower.includes('schweiz') || locationLower.includes('suisse') ||
      locationLower.includes('zurich') || locationLower.includes('zürich') || locationLower.includes('geneva') ||
      locationLower.includes('genève') || locationLower.includes('basel') || locationLower.includes('bern')) {
    return 'ch';
  }
  
  // Canada 🇨🇦
  if (locationLower.includes('canada') || locationLower.includes('toronto') || locationLower.includes('vancouver') ||
      locationLower.includes('montreal') || locationLower.includes('montréal') || locationLower.includes('calgary') ||
      locationLower.includes('ottawa') || locationLower.includes('edmonton')) {
    return 'ca';
  }
  
  // Australia 🇦🇺
  if (locationLower.includes('australia') || locationLower.includes('sydney') || locationLower.includes('melbourne') ||
      locationLower.includes('brisbane') || locationLower.includes('perth') || locationLower.includes('adelaide') ||
      locationLower.includes('canberra')) {
    return 'au';
  }
  
  // New Zealand 🇳🇿
  if (locationLower.includes('new zealand') || locationLower.includes('auckland') || locationLower.includes('wellington') ||
      locationLower.includes('christchurch') || locationLower.includes('hamilton') || locationLower.includes('dunedin')) {
    return 'nz';
  }
  
  // India 🇮🇳
  if (locationLower.includes('india') || locationLower.includes('bangalore') || locationLower.includes('bengaluru') ||
      locationLower.includes('mumbai') || locationLower.includes('delhi') || locationLower.includes('hyderabad') ||
      locationLower.includes('chennai') || locationLower.includes('pune') || locationLower.includes('kolkata')) {
    return 'in';
  }
  
  // Singapore 🇸🇬
  if (locationLower.includes('singapore')) {
    return 'sg';
  }
  
  // South Africa 🇿🇦
  if (locationLower.includes('south africa') || locationLower.includes('johannesburg') || locationLower.includes('cape town') ||
      locationLower.includes('durban') || locationLower.includes('pretoria') || locationLower.includes('port elizabeth')) {
    return 'za';
  }
  
  // Mexico 🇲🇽
  if (locationLower.includes('mexico') || locationLower.includes('méxico') || locationLower.includes('mexico city') ||
      locationLower.includes('guadalajara') || locationLower.includes('monterrey') || locationLower.includes('puebla')) {
    return 'mx';
  }
  
  // Russia 🇷🇺
  if (locationLower.includes('russia') || locationLower.includes('москва') || locationLower.includes('moscow') ||
      locationLower.includes('st petersburg') || locationLower.includes('saint petersburg') || locationLower.includes('novosibirsk')) {
    return 'ru';
  }
  
  // United States 🇺🇸 (check last as fallback for common city names)
  if (locationLower.includes('usa') || locationLower.includes('united states') || locationLower.includes('america') ||
      locationLower.includes('new york') || locationLower.includes('los angeles') || locationLower.includes('chicago') ||
      locationLower.includes('houston') || locationLower.includes('phoenix') || locationLower.includes('philadelphia') ||
      locationLower.includes('san antonio') || locationLower.includes('san diego') || locationLower.includes('dallas') ||
      locationLower.includes('san jose') || locationLower.includes('austin') || locationLower.includes('jacksonville') ||
      locationLower.includes('san francisco') || locationLower.includes('seattle') || locationLower.includes('denver') ||
      locationLower.includes('washington') || locationLower.includes('boston') || locationLower.includes('atlanta') ||
      locationLower.includes('miami') || locationLower.includes('detroit') || locationLower.includes('portland')) {
    return 'us';
  }
  
  // Default to GB if no match found
  return 'gb';
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


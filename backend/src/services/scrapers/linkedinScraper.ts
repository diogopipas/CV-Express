import puppeteer, { Browser, Page } from 'puppeteer';

interface JobListing {
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  jobUrl: string;
  source: 'LinkedIn';
  postedDate?: Date;
}

export const scrapeLinkedIn = async (keyword: string, location: string): Promise<JobListing[]> => {
  let browser: Browser | null = null;
  const jobs: JobListing[] = [];

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    const page: Page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`;
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for job listings to load
    await page.waitForSelector('.jobs-search__results-list', { timeout: 10000 }).catch(() => {
      console.log('LinkedIn jobs list not found - might require login');
    });

    // Extract job listings
    const linkedInJobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('.base-card');
      const jobsData: any[] = [];

      jobElements.forEach((element, index) => {
        if (index >= 10) return; // Limit to 10 jobs

        const titleEl = element.querySelector('.base-search-card__title');
        const companyEl = element.querySelector('.base-search-card__subtitle');
        const locationEl = element.querySelector('.job-search-card__location');
        const linkEl = element.querySelector('a.base-card__full-link');

        if (titleEl && companyEl && linkEl) {
          jobsData.push({
            title: titleEl.textContent?.trim() || '',
            company: companyEl.textContent?.trim() || '',
            location: locationEl?.textContent?.trim() || 'Remote',
            description: 'Click to view full details on LinkedIn',
            jobUrl: (linkEl as HTMLAnchorElement).href || '',
            source: 'LinkedIn'
          });
        }
      });

      return jobsData;
    });

    jobs.push(...linkedInJobs);
    
    console.log(`LinkedIn: Scraped ${jobs.length} jobs`);
  } catch (error) {
    console.error('LinkedIn scraping error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return jobs;
};


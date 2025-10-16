import puppeteer, { Browser, Page } from 'puppeteer';

interface JobListing {
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  jobUrl: string;
  source: 'Indeed';
  postedDate?: Date;
}

export const scrapeIndeed = async (keyword: string, location: string): Promise<JobListing[]> => {
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
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    const searchUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(keyword)}&l=${encodeURIComponent(location)}`;
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait a bit for dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract job listings
    const indeedJobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('.job_seen_beacon, .cardOutline');
      const jobsData: any[] = [];

      jobElements.forEach((element, index) => {
        if (index >= 10) return; // Limit to 10 jobs

        const titleEl = element.querySelector('h2.jobTitle span[title], h2 a span[title]');
        const companyEl = element.querySelector('[data-testid="company-name"], .companyName');
        const locationEl = element.querySelector('[data-testid="text-location"], .companyLocation');
        const salaryEl = element.querySelector('[data-testid="attribute_snippet_testid"], .salary-snippet');
        const linkEl = element.querySelector('h2.jobTitle a, h2 a');
        const snippetEl = element.querySelector('.job-snippet, [data-testid="job-snippet"]');

        if (titleEl && companyEl) {
          const relativeUrl = linkEl ? (linkEl as HTMLAnchorElement).getAttribute('href') : '';
          const fullUrl = relativeUrl ? `https://www.indeed.com${relativeUrl}` : '';

          jobsData.push({
            title: titleEl.getAttribute('title') || titleEl.textContent?.trim() || '',
            company: companyEl.textContent?.trim() || '',
            location: locationEl?.textContent?.trim() || 'Not specified',
            description: snippetEl?.textContent?.trim() || 'Click to view full details',
            salary: salaryEl?.textContent?.trim() || undefined,
            jobUrl: fullUrl,
            source: 'Indeed'
          });
        }
      });

      return jobsData;
    });

    jobs.push(...indeedJobs);
    
    console.log(`Indeed: Scraped ${jobs.length} jobs`);
  } catch (error) {
    console.error('Indeed scraping error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return jobs;
};


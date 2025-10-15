import puppeteer, { Browser, Page } from 'puppeteer';

interface JobListing {
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  jobUrl: string;
  source: 'Glassdoor';
  postedDate?: Date;
}

export const scrapeGlassdoor = async (keyword: string, location: string): Promise<JobListing[]> => {
  let browser: Browser | null = null;
  const jobs: JobListing[] = [];

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page: Page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    const searchUrl = `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(keyword)}&locT=C&locId=1&locKeyword=${encodeURIComponent(location)}`;
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Extract job listings
    const glassdoorJobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('[data-test="jobListing"], .react-job-listing, li[data-adv-type="GENERAL"]');
      const jobsData: {
        title: string;
        company: string;
        location: string;
        description: string;
        salary?: string;
        jobUrl: string;
        source: 'Glassdoor';
      }[] = [];

      jobElements.forEach((element: Element, index: number) => {
        if (index >= 10) return; // Limit to 10 jobs

        const titleEl = element.querySelector('[data-test="job-title"], .jobLink, a.jobTitle');
        const companyEl = element.querySelector('[data-test="employer-name"], .employerName');
        const locationEl = element.querySelector('[data-test="emp-location"], .location');
        const salaryEl = element.querySelector('[data-test="detailSalary"], .salaryEstimate');

        if (titleEl && companyEl) {
          const linkEl = titleEl.closest('a') || element.querySelector('a');
          const relativeUrl = linkEl ? linkEl.getAttribute('href') : '';
          const fullUrl = relativeUrl && relativeUrl.startsWith('/') ? `https://www.glassdoor.com${relativeUrl}` : relativeUrl || '';

          jobsData.push({
            title: titleEl.textContent?.trim() || '',
            company: companyEl.textContent?.trim() || '',
            location: locationEl?.textContent?.trim() || 'Not specified',
            description: 'Click to view full details on Glassdoor',
            salary: salaryEl?.textContent?.trim() || undefined,
            jobUrl: fullUrl,
            source: 'Glassdoor'
          });
        }
      });

      return jobsData;
    });

    jobs.push(...glassdoorJobs);
    
    console.log(`Glassdoor: Scraped ${jobs.length} jobs`);
  } catch (error) {
    console.error('Glassdoor scraping error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return jobs;
};


// Mock job scraper for testing - generates realistic fake job data
interface JobListing {
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  jobUrl: string;
  source: 'Mock';
  postedDate?: Date;
}

const companies = [
  'Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Tesla',
  'Stripe', 'Airbnb', 'Uber', 'Spotify', 'Twitter', 'Salesforce',
  'Adobe', 'Oracle', 'IBM', 'Intel', 'Cisco', 'Nvidia', 'PayPal',
  'Square', 'Dropbox', 'Slack', 'Zoom', 'DocuSign', 'Shopify'
];

const locations = [
  'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX',
  'Boston, MA', 'Denver, CO', 'Los Angeles, CA', 'Chicago, IL',
  'Portland, OR', 'Remote', 'Hybrid - San Jose, CA', 'Remote (US)'
];

const salaries = [
  '$80,000 - $120,000', '$100,000 - $150,000', '$120,000 - $180,000',
  '$90,000 - $130,000', '$110,000 - $160,000', '$140,000 - $200,000',
  '$150,000 - $220,000'
];

const generateJobDescription = (title: string, company: string): string => {
  return `${company} is seeking a talented ${title} to join our dynamic team. 

Key Responsibilities:
• Design and develop scalable applications
• Collaborate with cross-functional teams
• Write clean, maintainable code
• Participate in code reviews and technical discussions
• Contribute to system architecture decisions

Requirements:
• 3+ years of professional experience
• Strong problem-solving skills
• Experience with modern development frameworks
• Excellent communication skills
• Bachelor's degree in Computer Science or related field

Benefits:
• Competitive salary and equity
• Comprehensive health insurance
• 401(k) matching
• Flexible work arrangements
• Professional development opportunities
• Unlimited PTO`;
};

const generateJobTitle = (keyword: string): string => {
  const variations = [
    keyword,
    `Senior ${keyword}`,
    `${keyword} II`,
    `${keyword} III`,
    `Lead ${keyword}`,
    `Staff ${keyword}`,
    `Principal ${keyword}`
  ];
  return variations[Math.floor(Math.random() * variations.length)];
};

const getRandomElement = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomDate = (): Date => {
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

export const scrapeMockJobs = async (keyword: string, location: string): Promise<JobListing[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  // Generate 5-10 jobs per source
  const jobCount = Math.floor(Math.random() * 6) + 5; // 5-10 jobs
  const jobs: JobListing[] = [];

  for (let i = 0; i < jobCount; i++) {
    const company = getRandomElement(companies);
    const jobTitle = generateJobTitle(keyword);
    const companySlug = company.toLowerCase().replace(/\s+/g, '-');
    const titleSlug = jobTitle.toLowerCase().replace(/\s+/g, '-');
    const jobId = Math.floor(Math.random() * 1000000000);
    
    // Generate mock job URL
    const jobUrl = `https://mock-jobs.example.com/${companySlug}/${titleSlug}/${jobId}`;
    
    jobs.push({
      title: jobTitle,
      company: company,
      location: getRandomElement(locations),
      description: generateJobDescription(jobTitle, company),
      salary: Math.random() > 0.3 ? getRandomElement(salaries) : undefined,
      jobUrl: jobUrl,
      source: 'Mock',
      postedDate: getRandomDate()
    });
  }

  console.log(`Mock scraper generated ${jobs.length} jobs for "${keyword}" in "${location}"`);
  return jobs;
};

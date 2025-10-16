# Job Scraper Configuration

## Overview

The application supports three modes for job scraping:

1. **Adzuna API** (Recommended) - Real jobs via official API
2. **Mock Scraper** - For testing and development  
3. **Puppeteer Scrapers** - Direct scraping (limited, not recommended)

## Adzuna API (Recommended for Production)

### What is Adzuna?

Adzuna is a job search engine that aggregates listings from thousands of websites. Their API is free for up to 5,000 calls per month, making it perfect for this application.

### Setup Instructions

1. **Sign up for a free account**
   - Visit https://developer.adzuna.com/signup
   - Fill out the registration form
   - Verify your email

2. **Get your API credentials**
   - After signup, you'll receive:
     - Application ID
     - API Key
   - These will also be displayed in your developer dashboard

3. **Configure your environment**
   
   Create or update `backend/.env` file:
   ```env
   ADZUNA_APP_ID=your_app_id_here
   ADZUNA_API_KEY=your_api_key_here
   USE_MOCK_SCRAPER=false
   ```

4. **Restart the backend server**
   ```bash
   cd backend
   npm start
   ```

### Features

- Real job listings from thousands of sources
- Up to 50 results per search
- Multi-country support (US, UK, Canada, Australia, etc.)
- Salary information when available
- Professional job descriptions
- Direct links to apply
- 5,000 free API calls per month

### API Limits

- **Free Tier**: 5,000 calls/month
- **Rate Limiting**: Automatically handled
- **Results per call**: Up to 50 jobs

### Countries Supported

The scraper automatically detects country from location:
- United States (default)
- United Kingdom
- Canada
- Australia
- Germany
- France
- India

## Mock Scraper (Testing Only)

### Features
- ✅ **No Browser Required** - Works without Puppeteer/Chrome
- ✅ **Fast** - Instant results (1-2 second simulated delay)
- ✅ **Realistic Data** - Generates believable job listings
- ✅ **No Rate Limits** - Test as much as you want
- ✅ **No API Keys** - Completely free
- ✅ **Reliable** - No network issues or anti-bot protection

### Generated Data
Each mock scrape generates 5-10 jobs per source with:
- Realistic company names (Google, Meta, Amazon, etc.)
- Various locations (Remote, San Francisco, New York, etc.)
- Salary ranges ($80k - $220k)
- Detailed job descriptions
- Random posting dates (within last 30 days)
- Mix of LinkedIn, Indeed, and Glassdoor sources

### How to Use
Enable mock scraper by setting environment variable:

```bash
# In backend/.env
USE_MOCK_SCRAPER=true

# Or via terminal
USE_MOCK_SCRAPER=true npm start
```

## Puppeteer Scrapers (Not Recommended)

### Status
These direct web scrapers are included but **not recommended** due to reliability issues.

### Known Issues
- ❌ Anti-bot protection (LinkedIn, Indeed, Glassdoor)
- ❌ Browser launch failures on some systems
- ❌ Rate limiting
- ❌ CAPTCHA challenges
- ❌ Requiring authentication
- ❌ Frequent breaking changes

### Only use if
You don't have Adzuna API credentials and need to test without mock data. The system will automatically fall back to Puppeteer if Adzuna is not configured.

## How It Works

The system automatically chooses the best scraper:

1. **Adzuna API configured?** → Use Adzuna (best option)
2. **USE_MOCK_SCRAPER=true?** → Use Mock data
3. **Neither configured?** → Try Puppeteer, fallback to Mock

### Decision Flow

```
Upload Resume
    ↓
Extract Skills & Roles
    ↓
Check Configuration
    ↓
┌─────────────────────────────────┐
│ Adzuna API Key exists?          │
│  YES → Use Adzuna API ✅        │
│  NO  → Check mock setting       │
│         ↓                        │
│         USE_MOCK_SCRAPER=true?  │
│          YES → Mock Scraper 🎭  │
│          NO  → Puppeteer 🌐     │
│                (may fail)        │
└─────────────────────────────────┘
```

## Environment Variables

```env
# Required for Adzuna API
ADZUNA_APP_ID=your_app_id_here
ADZUNA_API_KEY=your_api_key_here

# Optional - force mock scraper
USE_MOCK_SCRAPER=false  # Set to 'true' to use mock data

# MongoDB and other settings
MONGODB_URI=mongodb://localhost:27017/cv-express
PORT=5001
```

## Checking Current Mode

The backend console shows which scraper is active:

```
🌟 Using Adzuna API for real job listings    # Adzuna API
🎭 Using MOCK scraper for testing           # Mock data
🌐 Using Puppeteer scrapers                 # Puppeteer (not recommended)
```

## Troubleshooting

### "Invalid Adzuna API credentials"
**Solution:** 
- Check that ADZUNA_APP_ID and ADZUNA_API_KEY are correct in `.env`
- Verify credentials at https://developer.adzuna.com
- Restart backend server after updating `.env`

### "Adzuna API rate limit exceeded"
**Solution:**
- You've exceeded 5,000 calls this month
- Wait until next month or upgrade plan
- System will fallback to mock scraper automatically

### "Failed to connect to Adzuna API"
**Solution:**
- Check internet connection
- Verify Adzuna API is not down
- Check firewall settings
- System will fallback to mock scraper

### No jobs appearing after upload
**Solution:** 
- Check backend console for scraper status
- Verify Adzuna API credentials
- Try different keywords or locations
- Check if job exists for that role in target location

## Current Implementation Status

✅ **Resume Upload & Analysis** - Working  
✅ **Automatic Job Scraping Trigger** - Working  
✅ **Adzuna API Integration** - Working  
✅ **Mock Data Generation** - Working (fallback)  
✅ **Job Display on Frontend** - Working  
✅ **Real Job Links** - Working (via Adzuna)  
⚠️ **Puppeteer Scrapers** - Limited by anti-bot protection  

## Testing the Full Flow

### With Adzuna API (Recommended)

1. Sign up at https://developer.adzuna.com/signup
2. Get your Application ID and API Key
3. Add credentials to `backend/.env`:
   ```env
   ADZUNA_APP_ID=your_app_id
   ADZUNA_API_KEY=your_api_key
   ```
4. Restart backend server
5. Upload a resume with tech skills
6. System finds REAL jobs from Adzuna
7. Click "View Job" to see actual job postings
8. Real salary data, descriptions, and apply links

### With Mock Scraper (Testing)

1. Set `USE_MOCK_SCRAPER=true` in `.env`
2. Upload a resume or click "Try Demo"
3. System generates realistic fake jobs
4. Good for UI testing and demos

**Adzuna API gives you real jobs with working links! 🎉**


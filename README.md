# CV-Express

A powerful job scraper application that finds real jobs from **24 countries** using the Adzuna API.

## ✨ Key Features

- 🌍 **24 Countries Supported** - Including Portugal, Spain, Brazil, UK, Germany, France, Italy, and more
- 🔍 **Real Job Listings** - Powered by Adzuna API with up to 50 jobs per search
- 💼 **Resume-Based Search** - Upload your resume to automatically find matching jobs
- 💾 **Save & Manage Jobs** - Keep track of interesting opportunities
- 📱 **Modern Responsive UI** - Beautiful interface built with React and Tailwind CSS
- 🔗 **Working Job Links** - Direct links to actual job postings

## 🌍 Supported Countries

🇵🇹 Portugal • 🇪🇸 Spain • 🇧🇷 Brazil • 🇬🇧 UK • 🇩🇪 Germany • 🇫🇷 France • 🇮🇹 Italy • 🇳🇱 Netherlands • 🇵🇱 Poland • 🇦🇹 Austria • 🇧🇪 Belgium • 🇨🇭 Switzerland • 🇨🇦 Canada • 🇺🇸 USA • 🇦🇺 Australia • 🇳🇿 New Zealand • 🇮🇳 India • 🇸🇬 Singapore • 🇿🇦 South Africa • 🇲🇽 Mexico • 🇷🇺 Russia

[See all supported cities →](./SUPPORTED_COUNTRIES.md)

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, MongoDB, TypeScript
- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Job Data**: Adzuna API (5,000 free calls/month)

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Adzuna API credentials (free) - [Get them here →](./ADZUNA_SETUP_GUIDE.md)

## 🚀 Quick Start

### Option 1: Automated Setup

Run the start script:

```bash
./START.sh
```

### Option 2: Manual Setup

1. **Install dependencies**
   ```bash
   npm run install:all
   ```

2. **Set up Adzuna API** (5 minutes)
   - Follow [ADZUNA_SETUP_GUIDE.md](./ADZUNA_SETUP_GUIDE.md)
   - Add credentials to `backend/.env`

3. **Start the application**
   ```bash
   npm run dev
   ```

The app will run on:
- Frontend: http://localhost:5173
- Backend: http://localhost:5001

## 💡 How to Use

1. **Upload a Resume** - Upload your CV (PDF or TXT)
2. **Automatic Job Search** - System extracts keywords and finds matching jobs
3. **Browse Results** - See real jobs from 24 countries
4. **Save Favorites** - Click the heart icon to save jobs for later
5. **Apply** - Click "View Job" to go to the actual job posting

## 📚 Documentation

- [Adzuna Setup Guide](./ADZUNA_SETUP_GUIDE.md) - 5-minute setup
- [Supported Countries](./SUPPORTED_COUNTRIES.md) - All supported countries and cities
- [Implementation Details](./ADZUNA_IMPLEMENTATION_SUMMARY.md) - Technical documentation
- [Scraper Configuration](./SCRAPER_CONFIGURATION.md) - Advanced configuration

## 🎯 Features

- ✅ Real job listings from Adzuna API
- ✅ Support for 24 countries worldwide
- ✅ Resume upload and parsing
- ✅ Job saving and management
- ✅ Salary information (when available)
- ✅ Pagination for easy browsing
- ✅ Modern responsive design
- ✅ Free tier: 5,000 API calls/month


# CV-Express Project Overview

## 📁 Project Structure

```
CV-Express/
│
├── 📂 backend/                    # Node.js/Express API Server
│   ├── 📂 src/
│   │   ├── 📂 config/
│   │   │   └── database.ts        # MongoDB connection setup
│   │   ├── 📂 models/
│   │   │   └── Job.ts             # Mongoose Job model
│   │   ├── 📂 routes/
│   │   │   └── jobRoutes.ts       # API endpoints
│   │   ├── 📂 services/
│   │   │   └── 📂 scrapers/
│   │   │       ├── linkedinScraper.ts
│   │   │       ├── indeedScraper.ts
│   │   │       ├── glassdoorScraper.ts
│   │   │       └── scraperManager.ts
│   │   └── server.ts              # Express app entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── nodemon.json
│   └── .env.example
│
├── 📂 frontend/                   # React + Vite Frontend
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── 📂 ui/            # shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   └── label.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── JobCard.tsx
│   │   │   ├── JobList.tsx
│   │   │   └── FilterPanel.tsx
│   │   ├── 📂 pages/
│   │   │   ├── Home.tsx          # Search & browse page
│   │   │   └── Saved.tsx         # Saved jobs page
│   │   ├── 📂 services/
│   │   │   └── api.ts            # API client & types
│   │   ├── 📂 store/
│   │   │   └── useJobStore.ts    # Zustand state management
│   │   ├── 📂 lib/
│   │   │   └── utils.ts          # Utility functions
│   │   ├── App.tsx               # Main app component
│   │   ├── main.tsx              # React entry point
│   │   └── index.css             # Tailwind styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── .env.example
│
├── package.json                   # Root package for scripts
├── README.md                      # Main documentation
├── SETUP.md                       # Setup instructions
└── .gitignore

```

## 🎯 Application Flow

### 1. Job Scraping Flow
```
User Input (Search) → Frontend SearchBar
                            ↓
                    POST /api/scrape
                            ↓
                   scraperManager.ts
                  ↙        ↓        ↘
         LinkedIn    Indeed    Glassdoor
         Scraper     Scraper   Scraper
                  ↘        ↓        ↙
                    Parallel Scraping
                            ↓
                    Save to MongoDB
                            ↓
                    Return Results
                            ↓
                    Display in JobList
```

### 2. Data Flow
```
MongoDB ← → Backend API ← → Frontend
  Job         Express         React
 Model        Routes          Components
```

### 3. State Management
```
Zustand Store (useJobStore)
├── jobs[]              # All search results
├── savedJobs[]         # Bookmarked jobs
├── isLoading           # Loading state
└── filters{}           # Active filters
```

## 🔑 Key Features Implemented

### Backend Features
✅ Multi-source job scraping (LinkedIn, Indeed, Glassdoor)
✅ Puppeteer-based web scraping with anti-detection
✅ MongoDB database with Mongoose ODM
✅ RESTful API with filtering & pagination
✅ Error handling & rate limiting
✅ TypeScript for type safety

### Frontend Features
✅ Modern React with Vite
✅ Beautiful UI with Tailwind CSS & shadcn/ui
✅ Responsive design (mobile-friendly)
✅ Real-time search with loading states
✅ Job filtering & sorting
✅ Save/bookmark functionality
✅ Toast notifications
✅ TypeScript throughout

## 📊 Database Schema

### Job Model
```typescript
{
  title: string              // Job title
  company: string            // Company name
  location: string           // Job location
  description: string        // Job description
  salary?: string           // Salary (optional)
  jobUrl: string            // Original job posting URL
  source: 'LinkedIn' | 'Indeed' | 'Glassdoor'
  postedDate?: Date         // When job was posted
  scrapedDate: Date         // When we scraped it
  saved: boolean            // Bookmark status
  tags: string[]            // Tags/categories
}
```

## 🛣️ API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scrape` | Scrape jobs from selected sources |
| GET | `/api/jobs` | Get all jobs (with filters) |
| GET | `/api/jobs/saved` | Get bookmarked jobs |
| GET | `/api/jobs/:id` | Get single job details |
| POST | `/api/jobs/:id/save` | Toggle bookmark status |
| DELETE | `/api/jobs/:id` | Delete a job |

## 🎨 UI Components

### Layout Components
- **Navbar**: Navigation with links to Search & Saved pages
- **FilterPanel**: Source & sort filters

### Job Components
- **SearchBar**: Search input with source selection
- **JobCard**: Individual job display card
- **JobList**: Grid of job cards

### UI Primitives (shadcn/ui)
- Button, Input, Card, Select, Checkbox, Label

## 🚀 Quick Start Commands

```bash
# Install all dependencies
npm run install:all

# Run both servers
npm run dev

# Run separately
npm run dev:backend    # Port 5000
npm run dev:frontend   # Port 3000

# Build for production
npm run build
```

## ⚙️ Environment Configuration

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cv-express
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Scraping**: Puppeteer
- **Language**: TypeScript
- **Dev Tools**: nodemon, ts-node

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Library**: shadcn/ui (Radix UI)
- **State**: Zustand
- **Routing**: React Router
- **HTTP Client**: Axios
- **Notifications**: Sonner
- **Language**: TypeScript

## 📝 Important Notes

### Web Scraping Limitations
⚠️ **Be aware that**:
- Job sites have anti-bot measures
- Scrapers may break when sites update their HTML
- Some sites have legal restrictions on scraping
- Rate limiting is essential to avoid IP bans
- Consider using official APIs when available

### Development Tips
1. **MongoDB**: Must be running before starting backend
2. **CORS**: Already configured for localhost development
3. **Proxy**: Vite proxies `/api` to backend automatically
4. **Hot Reload**: Both frontend and backend support hot reload

## 🎯 Next Steps for Enhancement

1. **Authentication**: Add user accounts and LinkedIn OAuth
2. **Auto-Apply**: Implement job application automation
3. **Notifications**: Email alerts for new matching jobs
4. **Advanced Filters**: Salary range, experience level, remote options
5. **Analytics**: Track application status and success rates
6. **Export**: Download saved jobs as PDF or CSV
7. **AI Integration**: Job matching based on resume/skills

## 📚 Documentation

- [Main README](README.md) - Project overview
- [SETUP.md](SETUP.md) - Detailed setup guide
- [Backend README](backend/README.md) - API documentation
- [Frontend README](frontend/README.md) - UI documentation

---

**Built with ❤️ using modern web technologies**


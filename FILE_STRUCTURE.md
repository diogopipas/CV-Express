# CV-Express Complete File Structure

## 📁 Project Overview

```
CV-Express/
├── backend/                          # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts           # MongoDB connection
│   │   ├── models/
│   │   │   ├── Job.ts                # Job schema
│   │   │   └── Resume.ts             # ✨ Resume schema (NEW)
│   │   ├── routes/
│   │   │   ├── jobRoutes.ts          # Job API endpoints
│   │   │   └── resumeRoutes.ts       # ✨ Resume API endpoints (NEW)
│   │   ├── services/
│   │   │   └── scrapers/
│   │   │       ├── scraperManager.ts
│   │   │       ├── linkedinScraper.ts
│   │   │       ├── indeedScraper.ts
│   │   │       └── glassdoorScraper.ts
│   │   └── server.ts                 # ✏️ Express app (MODIFIED)
│   ├── uploads/                      # ✨ Resume files storage (NEW)
│   ├── package.json
│   ├── tsconfig.json
│   └── nodemon.json
│
├── frontend/                         # React + TypeScript SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                   # ✨ Radix UI components (NEW)
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── dialog.tsx        # ✨ NEW
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── progress.tsx      # ✨ NEW
│   │   │   │   └── select.tsx
│   │   │   ├── FilterPanel.tsx       # Job filters
│   │   │   ├── JobCard.tsx           # Individual job display
│   │   │   ├── JobList.tsx           # Jobs grid
│   │   │   ├── Navbar.tsx            # ✏️ Navigation (MODIFIED)
│   │   │   ├── SearchBar.tsx         # Job search
│   │   │   └── UploadResumeDialog.tsx # ✨ Resume upload modal (NEW)
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Job search page
│   │   │   ├── Saved.tsx             # Saved jobs page
│   │   │   └── Resumes.tsx           # ✨ Resume dashboard (NEW)
│   │   ├── services/
│   │   │   └── api.ts                # ✏️ API client (MODIFIED)
│   │   ├── store/
│   │   │   ├── useJobStore.ts        # Job state management
│   │   │   └── useResumeStore.ts     # ✨ Resume state (NEW)
│   │   ├── lib/
│   │   │   └── utils.ts              # Utility functions
│   │   ├── App.tsx                   # ✏️ Main app component (MODIFIED)
│   │   ├── main.tsx                  # App entry point
│   │   └── index.css                 # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
│
├── documentation/                    # ✨ Feature documentation (NEW)
│   ├── CV_UPLOAD_FEATURE.md          # Technical documentation
│   ├── NEW_FEATURES_SUMMARY.md       # Feature overview
│   ├── RESUME_FEATURE_QUICKSTART.md  # User guide
│   ├── IMPLEMENTATION_COMPLETE.md    # Implementation summary
│   └── FILE_STRUCTURE.md             # This file
│
├── .gitignore                        # ✏️ (MODIFIED - added uploads/)
├── package.json                      # Root package.json
├── PROJECT_OVERVIEW.md               # Project documentation
├── QUICKSTART.md                     # Getting started guide
├── SETUP.md                          # Setup instructions
├── README.md                         # Main readme
├── START.sh                          # Start script
└── START-SIMPLE.sh                   # Simple start script
```

## 🎯 Key Files by Feature

### Resume Upload System

#### Backend Files
```
backend/src/
├── models/Resume.ts              # 📄 Resume data model
│   ├── filename, originalName
│   ├── filePath, fileSize
│   ├── uploadDate, status
│   ├── extractedSkills[]
│   ├── suggestedRoles[]
│   ├── searchedTitles[]
│   ├── jobSearchesUsed/Limit
│   ├── applicationStats
│   └── plan (FREE/PRO)
│
├── routes/resumeRoutes.ts        # 🛣️ API endpoints
│   ├── POST /upload
│   ├── GET /
│   ├── GET /latest
│   ├── GET /:id
│   ├── DELETE /:id
│   ├── PATCH /:id/stats
│   └── POST /:id/search-title
│
└── server.ts                     # 🚀 Express setup
    ├── Uploads directory creation
    ├── Static file serving
    └── Resume routes mounting
```

#### Frontend Files
```
frontend/src/
├── pages/Resumes.tsx             # 📊 Dashboard
│   ├── Overall progress cards
│   ├── Resume list
│   ├── Stats display
│   └── Management actions
│
├── components/
│   ├── UploadResumeDialog.tsx    # 📤 Upload modal
│   │   ├── Drag & drop
│   │   ├── File validation
│   │   ├── Upload progress
│   │   └── Success feedback
│   │
│   ├── Navbar.tsx                # 🧭 Navigation
│   │   ├── Upload button
│   │   └── My Resumes link
│   │
│   └── ui/
│       ├── dialog.tsx            # 🎨 Modal component
│       ├── badge.tsx             # 🏷️ Badge component
│       └── progress.tsx          # 📈 Progress bar
│
├── services/api.ts               # 🔌 API client
│   ├── Resume interface
│   └── resumeService methods
│
└── store/useResumeStore.ts       # 💾 State management
    ├── resumes[]
    ├── latestResume
    └── CRUD operations
```

## 📦 Dependencies by Package

### Backend Dependencies
```json
{
  "production": {
    "express": "^4.18.2",           // Web framework
    "mongoose": "^8.0.3",           // MongoDB ODM
    "cors": "^2.8.5",               // CORS middleware
    "dotenv": "^16.3.1",            // Environment variables
    "axios": "^1.6.2",              // HTTP client
    "cheerio": "^1.0.0-rc.12",      // HTML parsing
    "puppeteer": "^21.6.1",         // Browser automation
    "multer": "^2.0.2",             // ✨ File upload (NEW)
    "pdf-parse": "^2.3.12"          // ✨ PDF parsing (NEW)
  },
  "development": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.5",
    "@types/multer": "^2.0.0",      // ✨ NEW
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2"
  }
}
```

### Frontend Dependencies
```json
{
  "production": {
    "react": "^18.2.0",             // UI library
    "react-dom": "^18.2.0",         // DOM rendering
    "react-router-dom": "^6.20.1",  // Routing
    "zustand": "^4.4.7",            // State management
    "axios": "^1.6.2",              // HTTP client
    "lucide-react": "^0.294.0",     // Icons
    "sonner": "^1.2.0",             // Toasts
    "tailwind-merge": "^2.1.0",     // Tailwind utilities
    "clsx": "^2.0.0",               // Class names
    
    // Radix UI Components
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.1.15",    // ✨ NEW
    "@radix-ui/react-progress": "^1.1.7",   // ✨ NEW
    
    "class-variance-authority": "^0.7.1"    // ✨ NEW
  },
  "development": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
```

## 🔄 Data Flow Diagram

```
┌─────────────┐
│   User      │
│ (Browser)   │
└──────┬──────┘
       │
       │ 1. Upload Resume
       ▼
┌─────────────────────────┐
│  UploadResumeDialog     │
│  - Drag & Drop          │
│  - File Validation      │
└──────┬──────────────────┘
       │
       │ 2. FormData
       ▼
┌─────────────────────────┐
│  resumeService.upload() │
│  - API call             │
└──────┬──────────────────┘
       │
       │ 3. POST /api/resumes/upload
       ▼
┌─────────────────────────┐
│  Backend: multer        │
│  - Save file to uploads/│
│  - Create Resume record │
└──────┬──────────────────┘
       │
       │ 4. Parse PDF
       ▼
┌─────────────────────────┐
│  pdf-parse              │
│  - Extract text         │
│  - Find skills          │
│  - Suggest roles        │
└──────┬──────────────────┘
       │
       │ 5. Save to MongoDB
       ▼
┌─────────────────────────┐
│  Resume Model           │
│  - Store metadata       │
│  - Store skills         │
│  - Store suggestions    │
└──────┬──────────────────┘
       │
       │ 6. Return resume data
       ▼
┌─────────────────────────┐
│  useResumeStore         │
│  - Update state         │
│  - Add to resumes[]     │
└──────┬──────────────────┘
       │
       │ 7. Re-render
       ▼
┌─────────────────────────┐
│  Resumes Page           │
│  - Display card         │
│  - Show skills          │
│  - Show suggestions     │
└─────────────────────────┘
```

## 🎨 Component Tree

```
App.tsx
├── Router
│   ├── Navbar.tsx
│   │   ├── Logo Link
│   │   ├── Navigation Links
│   │   │   ├── Search Jobs (/)
│   │   │   ├── Saved Jobs (/saved)
│   │   │   └── My Resumes (/resumes) ✨
│   │   └── UploadResumeDialog ✨
│   │       ├── DialogTrigger (Button)
│   │       └── DialogContent
│   │           ├── DialogHeader
│   │           ├── File Upload Area
│   │           └── DialogFooter (Actions)
│   │
│   └── Routes
│       ├── Home (/)
│       │   ├── SearchBar
│       │   ├── FilterPanel
│       │   └── JobList
│       │       └── JobCard[]
│       │
│       ├── Saved (/saved)
│       │   └── JobList
│       │       └── JobCard[]
│       │
│       └── Resumes (/resumes) ✨
│           ├── Header with Actions
│           │   ├── Refresh Button
│           │   └── UploadResumeDialog
│           ├── Progress Cards
│           │   ├── Total Applications
│           │   ├── Successfully Applied
│           │   ├── Failed
│           │   └── In Queue
│           └── Resume Cards[]
│               ├── File Info
│               ├── Status Badges
│               ├── Searched Titles
│               ├── Suggested Roles
│               ├── Skills
│               ├── Job Stats
│               ├── Usage Stats
│               ├── Upgrade CTA
│               └── Actions (Delete, View Jobs)
│
└── Toaster (Notifications)
```

## 🗄️ Database Schema

### Resume Collection
```typescript
{
  _id: ObjectId,
  filename: string,                // "resume-1234567890.pdf"
  originalName: string,            // "John_Doe_Resume.pdf"
  filePath: string,                // "/uploads/resume-1234567890.pdf"
  fileSize: number,                // 245000 (bytes)
  uploadDate: Date,                // ISODate("2024-01-15T10:30:00Z")
  status: "completed",             // "processing" | "completed" | "failed"
  
  extractedSkills: [               // ✨ AI-extracted
    "JavaScript",
    "React",
    "Node.js",
    "MongoDB",
    "TypeScript"
  ],
  
  suggestedRoles: [                // ✨ AI-suggested
    "Software Engineer",
    "Frontend Developer",
    "Full Stack Developer"
  ],
  
  searchedTitles: [                // User search history
    "Software Engineer"
  ],
  
  jobSearchesUsed: 1,              // Usage tracking
  jobSearchesLimit: 1,             // Plan limit
  
  totalJobs: 47,                   // Statistics
  newJobs: 47,
  appliedJobs: 0,
  successfulApplications: 0,
  failedApplications: 0,
  inQueue: 0,
  
  resumeUsageCount: 1,             // Resume usage
  resumeUsageLimit: 3,
  
  plan: "FREE",                    // "FREE" | "PRO"
  isLatest: true                   // Latest upload flag
}
```

### Job Collection (Existing)
```typescript
{
  _id: ObjectId,
  title: string,
  company: string,
  location: string,
  description: string,
  salary: string,
  jobUrl: string,
  source: "LinkedIn" | "Indeed" | "Glassdoor",
  postedDate: string,
  scrapedDate: Date,
  saved: boolean,
  tags: string[]
}
```

## 🎯 State Management

### useResumeStore (Zustand)
```typescript
interface ResumeStore {
  // State
  resumes: Resume[],              // All resumes
  latestResume: Resume | null,    // Current resume
  isLoading: boolean,             // Loading state
  
  // Actions
  setResumes: (resumes) => void,
  setLatestResume: (resume) => void,
  setLoading: (loading) => void,
  addResume: (resume) => void,
  updateResume: (id, updates) => void,
  removeResume: (id) => void
}
```

### useJobStore (Existing)
```typescript
interface JobStore {
  jobs: Job[],
  savedJobs: Job[],
  isLoading: boolean,
  filters: { source?, location?, search? },
  
  setJobs: (jobs) => void,
  setSavedJobs: (jobs) => void,
  setLoading: (loading) => void,
  setFilters: (filters) => void,
  updateJob: (id, updates) => void,
  removeJob: (id) => void
}
```

## 📡 API Routes

### Resume Routes
```
Base URL: http://localhost:5001/api/resumes

POST   /upload
  Body: FormData { resume: File }
  Response: { success: true, message: string, data: Resume }

GET    /
  Response: { success: true, data: Resume[] }

GET    /latest
  Response: { success: true, data: Resume }

GET    /:id
  Response: { success: true, data: Resume }

DELETE /:id
  Response: { success: true, message: string }

PATCH  /:id/stats
  Body: { appliedJobs, successfulApplications, ... }
  Response: { success: true, data: Resume }

POST   /:id/search-title
  Body: { title: string }
  Response: { success: true, data: Resume }
```

### Job Routes (Existing)
```
Base URL: http://localhost:5001/api

POST   /scrape
GET    /jobs
GET    /jobs/saved
GET    /jobs/:id
POST   /jobs/:id/save
DELETE /jobs/:id
```

## 🎨 Styling Structure

### Tailwind Config
```javascript
{
  theme: {
    extend: {
      colors: {
        primary: "orange-600 to amber-600",
        accent: "cyan-500",
        success: "green-500",
        error: "red-500",
        warning: "yellow-500"
      }
    }
  }
}
```

### Component Styling Patterns
```
Card layouts: bg-card/80 backdrop-blur-sm rounded-lg border
Gradients: bg-gradient-to-br from-X to-Y
Badges: rounded-full px-2.5 py-0.5 text-xs
Buttons: rounded-md px-4 py-2 transition-colors
Icons: h-4 w-4 or h-5 w-5
Spacing: space-y-4, gap-4, p-4, p-6
```

---

## 📚 Documentation Files

1. **CV_UPLOAD_FEATURE.md** - Technical documentation
2. **NEW_FEATURES_SUMMARY.md** - Feature overview
3. **RESUME_FEATURE_QUICKSTART.md** - User guide
4. **IMPLEMENTATION_COMPLETE.md** - Implementation summary
5. **FILE_STRUCTURE.md** - This file

---

This file structure represents a complete, production-ready implementation of the CV upload feature with proper organization, documentation, and best practices. 🚀


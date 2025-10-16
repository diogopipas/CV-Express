# CV-Express Quick Reference Card

## 🚀 Quick Start Commands

```bash
# Start Backend
cd backend && npm run dev

# Start Frontend  
cd frontend && npm run dev

# Install Dependencies (if needed)
cd backend && npm install
cd frontend && npm install
```

## 🌐 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/health

## 📡 API Endpoints - Resume

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resumes/upload` | Upload resume |
| GET | `/api/resumes` | Get all resumes |
| GET | `/api/resumes/latest` | Get latest resume |
| GET | `/api/resumes/:id` | Get specific resume |
| DELETE | `/api/resumes/:id` | Delete resume |
| PATCH | `/api/resumes/:id/stats` | Update stats |
| POST | `/api/resumes/:id/search-title` | Add search title |

## 📡 API Endpoints - Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scrape` | Scrape jobs |
| GET | `/api/jobs` | Get all jobs |
| GET | `/api/jobs/saved` | Get saved jobs |
| GET | `/api/jobs/:id` | Get specific job |
| POST | `/api/jobs/:id/save` | Toggle save job |
| DELETE | `/api/jobs/:id` | Delete job |

## 🗂️ Key Files

### Backend
- `backend/src/models/Resume.ts` - Resume schema
- `backend/src/routes/resumeRoutes.ts` - Resume API
- `backend/src/server.ts` - Main server
- `backend/uploads/` - Uploaded files

### Frontend
- `frontend/src/pages/Resumes.tsx` - Resume dashboard
- `frontend/src/components/UploadResumeDialog.tsx` - Upload modal
- `frontend/src/store/useResumeStore.ts` - Resume state
- `frontend/src/services/api.ts` - API client

## 🎨 Component Import Paths

```typescript
// UI Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

// Pages
import Home from '@/pages/Home';
import Saved from '@/pages/Saved';
import Resumes from '@/pages/Resumes';

// Services
import { resumeService } from '@/services/api';

// Store
import { useResumeStore } from '@/store/useResumeStore';

// Icons
import { Upload, FileText, Trash2 } from 'lucide-react';
```

## 📦 State Management

### Resume Store (Zustand)
```typescript
const {
  resumes,           // Resume[]
  latestResume,      // Resume | null
  isLoading,         // boolean
  setResumes,        // (resumes: Resume[]) => void
  setLatestResume,   // (resume: Resume) => void
  addResume,         // (resume: Resume) => void
  updateResume,      // (id: string, updates: Partial<Resume>) => void
  removeResume,      // (id: string) => void
} = useResumeStore();
```

### Job Store (Existing)
```typescript
const {
  jobs,              // Job[]
  savedJobs,         // Job[]
  isLoading,         // boolean
  setJobs,           // (jobs: Job[]) => void
  updateJob,         // (id: string, updates: Partial<Job>) => void
  removeJob,         // (id: string) => void
} = useJobStore();
```

## 🎯 Common Tasks

### Upload a Resume
```typescript
const handleUpload = async (file: File) => {
  const response = await resumeService.upload(file);
  addResume(response.data);
  toast.success('Resume uploaded!');
};
```

### Get All Resumes
```typescript
const loadResumes = async () => {
  const response = await resumeService.getResumes();
  setResumes(response.data);
};
```

### Delete a Resume
```typescript
const handleDelete = async (id: string) => {
  await resumeService.deleteResume(id);
  removeResume(id);
  toast.success('Resume deleted!');
};
```

### Update Stats
```typescript
await resumeService.updateStats(resumeId, {
  appliedJobs: 5,
  successfulApplications: 3,
  failedApplications: 1,
  inQueue: 1
});
```

## 🛠️ Useful Code Snippets

### File Upload with Validation
```typescript
const validateFile = (file: File) => {
  const allowedTypes = ['application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large (max 10MB)');
  }
  
  return true;
};
```

### Format File Size
```typescript
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
```

### Format Date
```typescript
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
```

## 🎨 Tailwind Classes Reference

### Cards
```css
bg-card/80 backdrop-blur-sm rounded-lg border p-6 shadow-sm
```

### Buttons
```css
bg-cyan-500 hover:bg-cyan-600 text-white rounded-md px-4 py-2
```

### Badges
```css
rounded-full px-2.5 py-0.5 text-xs font-semibold border
```

### Gradients
```css
bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent
```

### Progress Cards
```css
/* Purple */
bg-purple-900/40 border-purple-700/40 text-purple-400

/* Green */
bg-green-900/40 border-green-700/40 text-green-400

/* Red */
bg-red-900/40 border-red-700/40 text-red-400

/* Yellow */
bg-yellow-900/40 border-yellow-700/40 text-yellow-400
```

## 🗄️ Database Queries

### Find Latest Resume
```javascript
Resume.findOne({ isLatest: true });
```

### Get All Resumes
```javascript
Resume.find().sort({ uploadDate: -1 });
```

### Update Resume Stats
```javascript
Resume.findByIdAndUpdate(id, {
  $set: { appliedJobs: 5, successfulApplications: 3 }
}, { new: true });
```

### Add Search Title
```javascript
Resume.findByIdAndUpdate(id, {
  $push: { searchedTitles: title },
  $inc: { jobSearchesUsed: 1 }
});
```

## 📊 Resume Schema Quick Reference

```typescript
interface Resume {
  _id: string;
  filename: string;              // Stored filename
  originalName: string;          // Original filename
  filePath: string;              // Path to file
  fileSize: number;              // Size in bytes
  uploadDate: string;            // ISO date string
  status: 'processing' | 'completed' | 'failed';
  extractedSkills: string[];     // AI-extracted
  suggestedRoles: string[];      // AI-suggested
  searchedTitles: string[];      // User searches
  jobSearchesUsed: number;       // Usage count
  jobSearchesLimit: number;      // Plan limit
  totalJobs: number;             // Stats
  newJobs: number;
  appliedJobs: number;
  successfulApplications: number;
  failedApplications: number;
  inQueue: number;
  resumeUsageCount: number;
  resumeUsageLimit: number;
  plan: 'FREE' | 'PRO';
  isLatest: boolean;
}
```

## 🎯 Environment Variables

```env
# Backend (.env)
PORT=5001
MONGODB_URI=mongodb://localhost:27017/cv-express

# Frontend (.env)
VITE_API_URL=http://localhost:5001/api
```

## 🐛 Common Issues & Fixes

### Resume Upload Fails
```bash
# Check uploads directory exists
ls backend/uploads/

# Check disk space
df -h

# Check file permissions
chmod 755 backend/uploads/
```

### Skills Not Extracting
```typescript
// Ensure PDF is text-based, not scanned
// Check pdf-parse installation
npm list pdf-parse

// Verify file upload completed
console.log('File path:', resume.filePath);
```

### MongoDB Connection Error
```bash
# Check MongoDB is running
mongosh

# Check connection string
echo $MONGODB_URI
```

## 📱 Routes Reference

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Home | Job search page |
| `/saved` | Saved | Saved jobs list |
| `/resumes` | Resumes | Resume dashboard |

## 🎨 Icons Used

```typescript
// From lucide-react
Upload, FileText, Trash2, Calendar, CheckCircle, XCircle,
Clock, Target, TrendingUp, Zap, Search, Briefcase, 
BookmarkIcon, X
```

## 📝 Toast Messages

```typescript
toast.success('Resume uploaded successfully!');
toast.error('Failed to upload resume');
toast.loading('Uploading resume...');
toast.warning('Search limit reached');
toast.info('Processing resume...');
```

## 🔒 File Upload Limits

- **Max Size**: 10MB
- **Allowed Types**: PDF, DOC, DOCX
- **Storage**: `backend/uploads/`
- **Naming**: `resume-{timestamp}-{random}.{ext}`

## 📈 Plan Limits

| Feature | FREE | PRO |
|---------|------|-----|
| Resumes | 3 | 10 |
| Searches per Resume | 1 | Unlimited |
| Resume Usage | 3 | Unlimited |
| Skill Extraction | ✅ | ✅ |
| Role Suggestions | ✅ | ✅ |

## 🎓 Learning Resources

- **Documentation**: See docs in project root
- **API Examples**: `CV_UPLOAD_FEATURE.md`
- **User Guide**: `RESUME_FEATURE_QUICKSTART.md`
- **Implementation**: `IMPLEMENTATION_COMPLETE.md`

---

**Last Updated**: October 15, 2024  
**Version**: 2.0.0

For detailed documentation, see the full docs in the project root.


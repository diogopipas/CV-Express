# CV Upload Feature Documentation

## Overview
The CV Upload feature allows users to upload their resumes in PDF or Word format. The system automatically extracts skills, suggests relevant job roles, and tracks application progress.

## Features

### 1. Resume Upload
- **Supported Formats**: PDF, DOC, DOCX
- **File Size Limit**: 10MB
- **Upload Methods**: 
  - Drag and drop
  - File browser selection
- **Processing**: Automatic skill extraction from PDF files

### 2. Resume Management
- View all uploaded resumes
- Mark latest resume
- Delete resumes
- Track resume usage

### 3. Application Progress Tracking
The system tracks the following metrics for each resume:
- **Total Applications**: Number of jobs applied to
- **Successfully Applied**: Number of successful applications
- **Failed**: Number of failed applications
- **In Queue**: Number of applications waiting to be processed

### 4. AI-Powered Features
- **Skill Extraction**: Automatically extracts technical skills from resumes
- **Role Suggestions**: AI suggests relevant job titles based on resume content
- **Job Matching**: Matches resumes with suitable job postings

### 5. Plan Management
- **FREE Plan**:
  - 1 job search per resume
  - 3 resume usage limit
- **PRO Plan**:
  - Unlimited job searches
  - 10 resume uploads
  - Priority processing

## Technical Implementation

### Backend

#### Models
- **Resume Model** (`backend/src/models/Resume.ts`)
  - Stores resume metadata
  - Tracks application statistics
  - Manages plan limits

#### Routes
- **POST** `/api/resumes/upload` - Upload a new resume
- **GET** `/api/resumes` - Get all resumes
- **GET** `/api/resumes/latest` - Get the latest resume
- **GET** `/api/resumes/:id` - Get a specific resume
- **DELETE** `/api/resumes/:id` - Delete a resume
- **PATCH** `/api/resumes/:id/stats` - Update resume statistics
- **POST** `/api/resumes/:id/search-title` - Add searched job title

#### Dependencies
- `multer` - File upload handling
- `pdf-parse` - PDF text extraction
- File storage in `backend/uploads/` directory

### Frontend

#### Pages
- **Resumes Page** (`frontend/src/pages/Resumes.tsx`)
  - Displays all uploaded resumes
  - Shows application progress stats
  - Resume management interface

#### Components
- **UploadResumeDialog** - Modal dialog for uploading resumes
- **UI Components**:
  - Dialog (Radix UI)
  - Badge
  - Progress bar

#### State Management
- **useResumeStore** - Zustand store for resume state management

#### API Services
- **resumeService** - API calls for resume operations

## Usage

### Uploading a Resume

1. Click the "Upload Resume" button in the navbar
2. Select a PDF or Word document (max 10MB)
3. Click "Upload" to process the file
4. The system will extract skills and suggest job roles

### Viewing Resumes

1. Navigate to "My Resumes" in the navbar
2. View all uploaded resumes with their details
3. See extracted skills and suggested roles
4. Track application progress

### Application Progress

The "Overall Application Progress" card shows:
- Total number of applications
- Successfully applied jobs
- Failed applications
- Jobs in queue

### Searching for Jobs

When you search for jobs with a resume uploaded:
1. The system tracks which job titles you searched for
2. Job search limit is enforced based on your plan
3. Application statistics are updated automatically

## API Examples

### Upload a Resume
```bash
curl -X POST http://localhost:5001/api/resumes/upload \
  -F "resume=@/path/to/resume.pdf"
```

### Get Latest Resume
```bash
curl http://localhost:5001/api/resumes/latest
```

### Update Resume Stats
```bash
curl -X PATCH http://localhost:5001/api/resumes/:id/stats \
  -H "Content-Type: application/json" \
  -d '{
    "appliedJobs": 5,
    "successfulApplications": 3,
    "failedApplications": 1,
    "inQueue": 1
  }'
```

## File Structure

```
backend/
├── src/
│   ├── models/
│   │   └── Resume.ts
│   ├── routes/
│   │   └── resumeRoutes.ts
│   └── server.ts
└── uploads/           # Resume files stored here

frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   └── progress.tsx
│   │   └── UploadResumeDialog.tsx
│   ├── pages/
│   │   └── Resumes.tsx
│   ├── services/
│   │   └── api.ts
│   └── store/
│       └── useResumeStore.ts
```

## Design Inspiration

The UI is inspired by modern job application tracking systems, featuring:
- Clean, card-based layouts
- Color-coded statistics (purple, green, red, yellow)
- Progress tracking with visual indicators
- Badge system for skills and roles
- Responsive design with Tailwind CSS

## Future Enhancements

Potential features to add:
1. Resume version comparison
2. Automatic job application submission
3. Cover letter generation based on resume
4. Interview preparation based on resume skills
5. Resume optimization suggestions
6. Multiple resume templates
7. Resume sharing and collaboration
8. Advanced analytics and insights
9. Integration with LinkedIn for auto-import
10. ATS (Applicant Tracking System) optimization scoring


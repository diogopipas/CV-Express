# Resume Upload Feature - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ installed
- MongoDB running locally or connection string available
- Both backend and frontend dependencies installed

### Starting the Application

#### 1. Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5001`

#### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

## 📤 Uploading Your First Resume

### Step 1: Navigate to Upload
1. Open `http://localhost:5173` in your browser
2. Look for the **"Upload Resume"** button (cyan color) in the top-right navigation
3. Click the button to open the upload dialog

### Step 2: Select Your Resume
You have two options:
- **Drag & Drop**: Drag your resume file into the upload area
- **Browse**: Click "Browse Files" to select from your computer

**Supported Formats:**
- PDF (.pdf)
- Word Document (.doc, .docx)

**Maximum Size:** 10MB

### Step 3: Upload
1. Once file is selected, you'll see a preview with filename and size
2. Click the **"Upload"** button
3. Wait for the upload to complete (you'll see a success message)

### Step 4: View Your Resume
1. The dialog will close automatically
2. Navigate to **"My Resumes"** in the navbar
3. Your resume will appear with:
   - Extracted skills (if PDF)
   - Suggested job roles
   - Application statistics
   - Usage limits

## 📊 Understanding the Dashboard

### Overall Application Progress
At the top of the Resumes page, you'll see four key metrics:

```
┌────────────────┬────────────────┬────────────────┬────────────────┐
│ Total          │ Successfully   │ Failed         │ In Queue       │
│ Applications   │ Applied        │                │                │
│ 0              │ 0              │ 0              │ 0              │
└────────────────┴────────────────┴────────────────┴────────────────┘
```

These update automatically as you:
- Search for jobs
- Apply to positions
- Track application status

### Resume Card Details

Each resume card shows:

**Header:**
- Resume filename
- "Latest" badge (for most recent)
- Plan badge (FREE/PRO)

**Metadata:**
- Upload date and time
- File size
- Processing status

**Extracted Information:**
- 🎯 **Searched Titles**: Job titles you've searched (cyan badges)
- 💼 **Suggested Roles**: AI-recommended positions (outline badges)
- ⚡ **Skills**: Technical skills found in resume (gray badges)

**Statistics:**
- Total Jobs found
- New Jobs available
- Job Searches used/limit

**Usage Information:**
- Resume usage count
- Search limit based on plan
- Upgrade prompt (FREE users)

## 🔍 Using Resume with Job Search

### Automatic Integration
Once you upload a resume:
1. Go to "Search Jobs" page
2. Search for any job title
3. The system automatically:
   - Tracks which titles you search
   - Increments your search count
   - Updates job statistics

### Search Limits
- **FREE Plan**: 1 job search per resume
- **PRO Plan**: Unlimited searches

When you reach the limit:
- You'll see a notification
- "Upgrade to Pro" prompt appears
- You can upload a new resume or upgrade

## 🎯 Best Practices

### Resume Naming
Use descriptive names for your resumes:
- ✅ `John_Doe_Software_Engineer_2024.pdf`
- ✅ `My_Resume_Full_Stack.pdf`
- ❌ `resume.pdf`
- ❌ `download.pdf`

### Multiple Resumes
Upload different versions for different job types:
- `Resume_Frontend_Developer.pdf`
- `Resume_Data_Scientist.pdf`
- `Resume_Product_Manager.pdf`

### PDF Recommendations
For best skill extraction:
- Use text-based PDFs (not scanned images)
- Include clear section headers (Skills, Experience, Education)
- List technologies and tools explicitly
- Use standard resume formatting

### Skills to Include
The system recognizes 50+ common skills including:
- **Languages**: JavaScript, Python, Java, C++, TypeScript, Go, Rust
- **Frameworks**: React, Angular, Vue, Node.js, Django, Spring
- **Databases**: MongoDB, PostgreSQL, MySQL, Redis
- **Cloud**: AWS, Azure, GCP, Docker, Kubernetes
- **Tools**: Git, CI/CD, Linux, Testing frameworks

## 🔧 Troubleshooting

### Upload Fails
**Problem**: File won't upload
**Solutions**:
- Check file size (max 10MB)
- Verify file format (PDF, DOC, DOCX only)
- Ensure backend server is running
- Check browser console for errors

### No Skills Extracted
**Problem**: Resume uploaded but no skills shown
**Solutions**:
- Ensure file is PDF (Word docs don't extract skills yet)
- Check if PDF is text-based (not a scanned image)
- Skills should be explicitly mentioned in resume text
- Try a different PDF export

### Can't Delete Resume
**Problem**: Delete button doesn't work
**Solutions**:
- Refresh the page
- Check if you're the resume owner
- Verify backend connection
- Check browser console for errors

### Search Limit Reached
**Problem**: "Search limit reached" message
**Solutions**:
- Upgrade to PRO plan for unlimited searches
- Upload a new resume (resets search count)
- Wait for plan reset (if applicable)

## 💡 Tips & Tricks

### Maximize Skill Detection
1. List all technologies in a "Skills" section
2. Mention tools in project descriptions
3. Include certifications and courses
4. Use standard technology names

### Optimize Job Matching
1. Upload multiple resumes for different roles
2. Mark your preferred resume as latest
3. Use suggested roles for job searches
4. Update resume regularly

### Track Your Progress
1. Check dashboard daily for new jobs
2. Monitor success/fail rates
3. Adjust resume based on results
4. Keep track of search limits

## 📈 Understanding Plans

### FREE Plan Features
- ✅ 1 resume upload active at a time
- ✅ 3 resume uploads total
- ✅ 1 job search per resume
- ✅ Basic skill extraction
- ✅ Job role suggestions
- ✅ Application tracking

### PRO Plan Features
- ✅ Up to 10 resumes
- ✅ Unlimited job searches
- ✅ Priority processing
- ✅ Advanced analytics
- ✅ Resume version history
- ✅ Priority support

### Upgrading
1. Click any "Upgrade Now" button
2. Select PRO plan
3. Complete payment
4. Instant feature unlock

## 🎓 Example Workflow

### Scenario: Recent Graduate Job Search

**Step 1**: Upload Resume
```
File: Emily_Chen_Software_Engineer_2024.pdf
Size: 245 KB
Skills Detected: JavaScript, React, Python, Git, SQL
Suggested Roles: Software Engineer, Frontend Developer, Full Stack Developer
```

**Step 2**: Search for Jobs
- Navigate to "Search Jobs"
- Search "Software Engineer" in "San Francisco, CA"
- Select sources: LinkedIn, Indeed, Glassdoor
- Click "Search Jobs"

**Step 3**: Track Progress
- Return to "My Resumes"
- View updated statistics:
  - Total Jobs: 47
  - New Jobs: 47
  - Job Searches Used: 1/1

**Step 4**: Apply to Jobs
- Go back to "Search Jobs"
- Browse results
- Save interesting positions
- Apply externally

**Step 5**: Update Resume
- After gaining new skills
- Upload updated resume
- Previous stats preserved
- New resume marked "Latest"

## 🔔 Notifications

Watch for these toast notifications:
- ✅ "Resume uploaded successfully!"
- ⚠️ "Search limit reached"
- ❌ "Failed to upload resume"
- ℹ️ "Processing resume..."

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review console errors
3. Verify server status
4. Check documentation files
5. Report bugs with details

## 🌟 Pro Tips

1. **Upload Early**: Get skill suggestions before job hunting
2. **Use Suggested Roles**: AI-generated recommendations are accurate
3. **Track Everything**: Monitor success rates to improve
4. **Update Regularly**: Keep resume current for best matches
5. **Multiple Versions**: Different resumes for different job types

---

**Happy Job Hunting!** 🎉

The Resume Upload feature makes CV-Express a complete job search platform. Upload your resume, track applications, and land your dream job!


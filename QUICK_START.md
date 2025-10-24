# Quick Start Guide - Auto-Apply Pipeline

This guide will help you quickly set up and test the new auto-apply pipeline features.

## 🚀 Quick Setup (5 minutes)

### 1. Install New Dependencies

```bash
# In the backend directory
cd backend
npm install

# In the frontend directory  
cd ../frontend
npm install
```

### 2. Optional: Add Gemini API Key

For advanced CV parsing (recommended but not required):

Create or update `/backend/.env`:
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

> **Note:** Without Gemini, the system will use a fallback regex-based parser. It still works, just not as smart.

### 3. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🎯 Test the Features

### Test 1: User Onboarding (2 minutes)

1. Register a new account or login
2. Navigate to `/onboarding`
3. Complete the 4-step onboarding:
   - Step 1: Add desired roles (e.g., "Software Engineer", "Full Stack Developer")
   - Step 2: Set location preferences
   - Step 3: Set salary expectations (optional)
   - Step 4: Add work authorization details
4. Click "Complete Setup"

**Expected Result:** Your profile is now configured with preferences for job matching.

### Test 2: Upload a Resume with Advanced Parsing (2 minutes)

1. Go to the "Search Jobs" page
2. Click "Upload Resume"
3. Upload a PDF or text resume
4. Wait a few seconds for processing

**Expected Result:** 
- Resume uploads successfully
- If Gemini is configured: See detailed parsed data (work experience, education, skills categorized)
- If no Gemini: See basic skills extraction

### Test 3: Add Jobs to Queue (3 minutes)

1. On the Jobs page, find a job that interests you
2. Click the "Add to Queue" button (you may need to add this to JobCard component)
3. Go to `/queue` page

**Expected Result:**
- Job appears in queue with a match score (0-100%)
- See match reasons breakdown:
  - Skills match
  - Role match
  - Location match
  - Salary match

### Test 4: Review and Approve Queue (2 minutes)

1. On the Queue page, review the matched jobs
2. Click "Approve" on jobs you want to apply to (or use bulk select)
3. Click "Approve Selected" for multiple jobs
4. Click "Process X Approved" button

**Expected Result:**
- Approved jobs move to "approved" status
- Processing creates Application records
- Jobs move to "completed" status

### Test 5: View Applications (1 minute)

1. Go to `/applications` page
2. See your processed applications

**Expected Result:**
- Applications created from queue show up
- Status is initially "pending" (will be updated by extension)
- Timeline shows queue processing events

### Test 6: Inbox (Demo Mode)

Since email integration requires external setup, you can test the inbox UI:

1. Go to `/inbox` page
2. See the empty inbox interface

**To test with real data**, you can manually insert a test email via MongoDB:

```javascript
// MongoDB shell or Compass
db.emails.insertOne({
  userId: ObjectId("your-user-id"),
  from: "recruiter@example.com",
  to: "applications-12345678@cvexpress.com",
  subject: "Interview Invitation - Software Engineer",
  body: "We'd like to schedule an interview...",
  category: "interview",
  isRead: false,
  receivedAt: new Date()
})
```

## 🔧 Quick API Tests with cURL

### Get User Profile
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/auth/profile
```

### Update Profile
```bash
curl -X PATCH \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobPreferences": {
      "desiredRoles": ["Software Engineer"],
      "remotePreference": "remote"
    }
  }' \
  http://localhost:5000/api/auth/profile
```

### Add Job to Queue
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "JOB_ID_HERE",
    "resumeId": "RESUME_ID_HERE"
  }' \
  http://localhost:5000/api/applications/queue
```

### Get Queue
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/applications/queue
```

### Approve Job in Queue
```bash
curl -X PATCH \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "approve"}' \
  http://localhost:5000/api/applications/queue/QUEUE_ITEM_ID/review
```

### Process Queue
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 10}' \
  http://localhost:5000/api/applications/queue/process
```

## 🐛 Troubleshooting

### Issue: "Gemini parsing failed"
**Solution:** This is normal if you don't have an API key. The system falls back to regex parsing automatically.

### Issue: Match scores are all 50%
**Solution:** Complete the onboarding to add your preferences. Without preferences, the system can't calculate accurate matches.

### Issue: Queue processing doesn't create applications
**Solution:** Make sure you've approved the queue items first. Only "approved" status items are processed.

### Issue: Inbox is empty
**Solution:** Email integration requires external setup. See IMPLEMENTATION_SUMMARY.md for details.

## 📊 Check It's Working

### Verify User Profile
```bash
# Should show expanded profile with preferences
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/auth/profile | json_pp
```

### Verify Resume Parsing
```bash
# Should show parsedData field with structured information
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/resumes/RESUME_ID | json_pp
```

### Verify Queue Stats
```bash
# Should show counts for different statuses
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/applications/queue | json_pp
```

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ Onboarding completes and saves preferences
2. ✅ Resume upload extracts skills (and optionally detailed data with Gemini)
3. ✅ Jobs added to queue show match scores
4. ✅ Queue shows match reasons breakdown
5. ✅ Approved jobs can be processed in batch
6. ✅ Applications are created from processed queue items
7. ✅ User's application email is visible in profile (applications-XXXXXXXX@cvexpress.com)

## 🚧 Known Limitations (Intentional)

1. **Extension Auto-Apply:** The browser extension still needs to be updated to automatically submit forms. Currently, it only fills them.

2. **Email Forwarding:** Requires external email service setup (ForwardEmail.net, SendGrid, etc.)

3. **LinkedIn OAuth:** Requires LinkedIn app approval (can take several days)

4. **Rate Limiting:** Not yet implemented - be careful not to spam job sites

## 📚 Next Steps

1. **Update Extension:** Modify the browser extension to:
   - Poll for approved queue items
   - Actually submit the forms
   - Report back success/failure

2. **Set Up Email Forwarding:** Choose and configure an email service

3. **Add LinkedIn OAuth:** Apply for LinkedIn developer access

4. **Customize Match Algorithm:** Adjust weights in `/backend/src/services/matchingService.ts`

5. **Add More ATS Adapters:** Enhance form detection for more job sites

## 💡 Pro Tips

- **Start with small batch sizes** (5-10 jobs) when testing queue processing
- **Fill out onboarding completely** for best match scores
- **Upload a detailed resume** for better parsing results
- **Use Gemini for production** - the parsing is significantly better
- **Check application timelines** to debug the queue → application flow

## 🆘 Need Help?

Check these files for implementation details:
- `IMPLEMENTATION_SUMMARY.md` - Complete feature documentation
- `auto-apply-pipeline-implementation.plan.md` - Original plan
- Backend services in `/backend/src/services/`
- Frontend pages in `/frontend/src/pages/`

Happy auto-applying! 🎯


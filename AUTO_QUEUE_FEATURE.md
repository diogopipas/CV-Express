# Auto-Queue Feature Documentation

## Overview

The Auto-Queue feature automatically analyzes and queues job matches when performing a job search. This eliminates the need to manually review every job and add suitable ones to your application queue.

## How It Works

### 1. Search Phase
When a user performs a job search:
- Jobs are scraped from multiple platforms (Adzuna, Arbeitnow, JSearch)
- Jobs are saved to the database with location details

### 2. Automatic Analysis Phase
Immediately after scraping, each job is automatically:
- **Analyzed** using the matching algorithm (skills, role, location, salary)
- **Scored** on a 0-100 scale based on match quality
- **Filtered** based on a minimum match score threshold

### 3. Auto-Queue Phase
Jobs that meet the threshold are automatically:
- **Added to ApplicationQueue** with status `pending_review`
- **Prepared with auto-fill data** from user profile and resume
- **Ready for user review** before final application

## Match Score Calculation

The matching algorithm evaluates four key factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| **Skills Match** | 40% | Compares user skills with job requirements |
| **Role Match** | 25% | Matches desired roles with job title |
| **Location Match** | 20% | Evaluates location preferences vs job location |
| **Salary Match** | 15% | Compares salary expectations with job salary |

### Example Match Reasons

Each queued job includes detailed match reasons:

```json
{
  "matchScore": 85,
  "matchReasons": [
    {
      "category": "skills",
      "score": 90,
      "details": "JavaScript, React, Node.js, TypeScript, MongoDB"
    },
    {
      "category": "role",
      "score": 100,
      "details": "Looking for: Full Stack Developer, Software Engineer"
    },
    {
      "category": "location",
      "score": 80,
      "details": "Preferred: San Francisco, Remote"
    },
    {
      "category": "salary",
      "score": 70,
      "details": "Expecting: 100000-150000 USD"
    }
  ]
}
```

## Configuration

### Environment Variables

Configure the auto-queue behavior in your `.env` file:

```bash
# Minimum match score for auto-queueing (default: 60)
# Jobs with scores below this threshold will not be auto-queued
MIN_AUTO_QUEUE_MATCH_SCORE=60
```

### Adjusting the Threshold

- **Lower threshold (e.g., 50)**: More jobs queued, less selective
- **Higher threshold (e.g., 75)**: Fewer jobs queued, more selective
- **Recommended**: 60-70 for balanced results

## User Flow

### Step-by-Step Process

1. **User initiates job search**
   - Provides keyword and location
   - Selects resume to use

2. **System scrapes jobs**
   ```
   🔍 Searching for "Full Stack Developer" in "San Francisco"...
   ```

3. **System analyzes matches**
   ```
   🔍 Analyzing 45 jobs for auto-queue...
   ✅ Queued: Senior Full Stack Developer at TechCorp (85% match)
   ✅ Queued: Software Engineer at StartupXYZ (78% match)
   ...
   📊 Auto-queue complete: 12/45 jobs added to queue
   ```

4. **User receives feedback**
   ```
   ✅ Found 45 matching jobs!
   • 12 jobs auto-queued for review
   
   🎯 Smart Match Complete
   12 jobs scored 60%+ and were added to your application queue for review
   ```

5. **User reviews queue**
   - Navigate to Applications → Queue
   - Review match scores and reasons
   - Approve or reject each job
   - System processes approved jobs

## API Endpoints

### POST /api/scrape

Trigger job search with automatic analysis and queueing.

**Request:**
```json
{
  "keyword": "Full Stack Developer",
  "location": "San Francisco",
  "resumeId": "64f2a1b2c3d4e5f6a7b8c9d0",
  "autoQueue": true,  // Enable/disable auto-queue
  "useCache": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Found 45 jobs. 12 jobs automatically added to queue",
  "data": [...],
  "queueInfo": {
    "analyzed": 45,
    "queued": 12,
    "minMatchScore": 60,
    "queuedJobs": [
      {
        "jobId": "64f2a1b2c3d4e5f6a7b8c9d1",
        "jobTitle": "Senior Full Stack Developer",
        "company": "TechCorp",
        "matchScore": 85
      },
      ...
    ]
  }
}
```

### GET /api/applications/queue

Retrieve queued applications for review.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f2a1b2c3d4e5f6a7b8c9d2",
      "jobId": {...},
      "resumeId": {...},
      "matchScore": 85,
      "matchReasons": [...],
      "status": "pending_review",
      "autoFillData": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        ...
      }
    }
  ],
  "stats": {
    "pending_review": 12,
    "approved": 5,
    "rejected": 3,
    "processing": 1,
    "completed": 8,
    "failed": 0
  }
}
```

## Benefits

### For Users
- ✅ **Time Savings**: No need to manually review every job
- ✅ **Smart Filtering**: AI identifies best matches automatically
- ✅ **Transparency**: See exactly why jobs were matched
- ✅ **Control**: Review and approve before applying

### For System
- ✅ **Efficient Processing**: Batch analysis during search
- ✅ **Quality Applications**: Only well-matched jobs proceed
- ✅ **Better Tracking**: Complete audit trail from search to application

## Technical Implementation

### Backend Architecture

```
JobRoutes (/api/scrape)
    ↓
scraperManager.scrapeJobs()
    ↓
[Jobs saved to database]
    ↓
autoAnalyzeAndQueue()
    ↓
For each job:
  - Check if already queued/applied
  - calculateMatchScore()
  - If score >= threshold:
    → Create ApplicationQueue entry
    → Prepare auto-fill data
    → Status: pending_review
```

### Key Files

- **Backend**
  - `backend/src/routes/jobRoutes.ts` - Main auto-queue logic
  - `backend/src/services/matchingService.ts` - Match score calculation
  - `backend/src/services/queueProcessor.ts` - Queue management
  - `backend/src/models/ApplicationQueue.ts` - Queue data model

- **Frontend**
  - `frontend/src/pages/Resumes.tsx` - Search UI and queue notifications
  - `frontend/src/services/api.ts` - API integration

## Queue Management

### Queue Statuses

| Status | Description |
|--------|-------------|
| `pending_review` | Awaiting user review (auto-queued) |
| `approved` | User approved, ready for processing |
| `rejected` | User rejected, will not apply |
| `processing` | Currently being processed |
| `completed` | Application submitted successfully |
| `failed` | Application failed (with retry logic) |

### Bulk Operations

Users can:
- **Bulk Approve**: Approve multiple jobs at once
- **Bulk Reject**: Reject multiple jobs at once
- **Filter by Score**: View jobs by match score range
- **Sort by Date**: Process oldest jobs first

## Performance Considerations

### Optimization Strategies

1. **Batch Processing**: All jobs analyzed in one pass
2. **Database Queries**: Efficient duplicate checking
3. **Async Operations**: Non-blocking queue operations
4. **Caching**: Reuse analysis for duplicate jobs

### Expected Performance

- **Analysis**: ~50ms per job
- **Queue Creation**: ~100ms per job
- **Total overhead**: ~3-5 seconds for 50 jobs

## Future Enhancements

Potential improvements:

1. **Machine Learning**: Learn from user approvals/rejections
2. **Custom Weights**: Let users adjust match score weights
3. **Auto-Approve**: Optional auto-approval for very high scores (90%+)
4. **Scheduling**: Queue jobs for specific times/days
5. **Priority Scoring**: Factor in application deadline urgency
6. **Notifications**: Email/push notifications for new queue items

## Troubleshooting

### Common Issues

**Q: Why aren't any jobs being auto-queued?**
- Check `MIN_AUTO_QUEUE_MATCH_SCORE` threshold
- Verify user profile has complete information (skills, preferences)
- Review match scores in job listings

**Q: Too many jobs being queued?**
- Increase `MIN_AUTO_QUEUE_MATCH_SCORE` threshold
- Update user profile with more specific preferences

**Q: Queue items missing auto-fill data?**
- Ensure user profile is complete
- Check application preferences in profile settings
- Verify resume has been parsed successfully

## Best Practices

### For Users
1. **Complete Your Profile**: Better profile = better matches
2. **Set Preferences**: Define desired roles, locations, salary
3. **Review Regularly**: Check queue weekly
4. **Provide Feedback**: System learns from your approvals

### For Developers
1. **Monitor Match Scores**: Track average scores over time
2. **Tune Threshold**: Adjust based on user feedback
3. **Log Analysis**: Keep detailed logs for debugging
4. **Test Edge Cases**: New user, no skills, no preferences

---

## Summary

The Auto-Queue feature streamlines the job application process by automatically identifying and queueing high-quality job matches based on comprehensive analysis. Users maintain full control through the review process while benefiting from AI-powered filtering and matching.

**Key Takeaway**: Search once, let AI find your best matches automatically! 🎯


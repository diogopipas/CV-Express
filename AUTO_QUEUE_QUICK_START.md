# Auto-Queue Quick Start Guide

## What's New? 🚀

When you search for jobs, the system now automatically analyzes each job and adds high-quality matches to your application queue for review!

## How to Use

### 1. Search for Jobs
- Go to **Resumes** page
- Select your resume
- Enter job keywords and location
- Click **Search**

### 2. Automatic Analysis Happens
Behind the scenes, the system:
- Calculates a match score for each job (0-100)
- Compares your skills, desired roles, location, and salary
- Automatically queues jobs scoring 60% or higher

### 3. Review Your Queue
- Navigate to **Applications** → **Queue** tab
- See all auto-queued jobs with their match scores
- Review match reasons (why this job was selected)
- **Approve** jobs you want to apply to
- **Reject** jobs you're not interested in

### 4. Process Applications
- Click **Process Queue** to submit approved applications
- The system will auto-fill your information
- Track application status in the **Applications** page

## Configuration (Optional)

### Adjust Match Score Threshold

To change how selective the auto-queue is, add this to your backend `.env` file:

```bash
# Default is 60 (recommended: 60-70)
MIN_AUTO_QUEUE_MATCH_SCORE=70
```

**Lower number** = More jobs queued (less selective)
**Higher number** = Fewer jobs queued (more selective)

## Example Workflow

```
Search: "Full Stack Developer" in "Remote"
    ↓
System finds: 50 jobs
    ↓
System analyzes all 50 jobs
    ↓
15 jobs score 60%+ → Auto-queued ✅
35 jobs score below 60% → Not queued ❌
    ↓
You receive notification:
"✅ Found 50 matching jobs!"
"🎯 15 jobs auto-queued for review"
    ↓
Review the 15 queued jobs
    ↓
Approve 10, reject 5
    ↓
Process queue → Applications submitted! 🎉
```

## Match Score Breakdown

Your match score is calculated from:

- **Skills** (40%): How well your skills match job requirements
- **Role** (25%): How well your desired roles match the job title
- **Location** (20%): How well the job location matches your preferences
- **Salary** (15%): How well the salary matches your expectations

## Tips for Better Matches

1. **Complete Your Profile**
   - Add all your skills
   - Set desired job roles
   - Specify location preferences
   - Set salary expectations

2. **Keep Resume Updated**
   - Upload latest resume
   - System extracts skills automatically
   - Better resume = better matches

3. **Review Queue Regularly**
   - Check queue after each search
   - Approve/reject promptly
   - System learns from your choices (future enhancement)

## Notifications

You'll see these notifications:

1. **Search Started**: "🔍 Searching for jobs..."
2. **Jobs Found**: "✅ Found 50 matching jobs!"
3. **Auto-Queue Results**: "🎯 15 jobs scored 60%+ and were added to your queue"

## Frequently Asked Questions

**Q: Can I turn off auto-queue?**
A: Yes! Set `autoQueue: false` in the search request, or set `MIN_AUTO_QUEUE_MATCH_SCORE=100` to disable.

**Q: What if no jobs are queued?**
A: This means no jobs scored above the threshold (60%). Try:
- Broadening your search terms
- Completing your profile
- Lowering the threshold

**Q: Are queued jobs automatically applied?**
A: No! Jobs are queued for **your review**. You must approve them before they're processed.

**Q: Can I manually add jobs to queue?**
A: Yes! Click "Add to Queue" on any job card to manually queue it.

**Q: What happens to jobs not auto-queued?**
A: They're still visible in the search results. You can manually add them to the queue if desired.

## Benefits

✅ **Save Time**: No need to manually review every job
✅ **Smart Filtering**: AI identifies best matches
✅ **Stay Organized**: All top jobs in one queue
✅ **Make Informed Decisions**: See match scores and reasons
✅ **Maintain Control**: You approve before applying

## Need Help?

If you have questions or issues:
1. Check the full documentation: `AUTO_QUEUE_FEATURE.md`
2. Review your profile completeness
3. Check browser console for errors
4. Contact support

---

**Ready to try it?** Go search for jobs and watch the magic happen! ✨


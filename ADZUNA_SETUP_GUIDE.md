# Adzuna API Setup Guide

## Quick Start (5 minutes)

Follow these steps to connect your app to real job listings:

### Step 1: Sign Up for Adzuna API (2 min)

1. Go to: **https://developer.adzuna.com/signup**
2. Fill out the registration form:
   - Name
   - Email
   - Company (you can use "Personal Project")
   - Use case (e.g., "Job search application")
3. Click "Sign Up"
4. Check your email and verify your account

### Step 2: Get Your API Credentials (1 min)

After email verification:

1. Log in to https://developer.adzuna.com
2. You'll see your credentials on the dashboard:
   ```
   Application ID: XXXXXXXX
   API Key: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
3. Copy both values

### Step 3: Configure Backend (1 min)

1. Navigate to `backend` folder in your project

2. Create a `.env` file if it doesn't exist:
   ```bash
   cd backend
   touch .env
   ```

3. Add your Adzuna credentials to `backend/.env`:
   ```env
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/cv-express
   PORT=5001

   # Adzuna API (add these)
   ADZUNA_APP_ID=your_app_id_here
   ADZUNA_API_KEY=your_api_key_here

   # Don't use mock scraper
   USE_MOCK_SCRAPER=false
   ```

4. Replace `your_app_id_here` and `your_api_key_here` with your actual credentials

### Step 4: Restart Backend (1 min)

```bash
cd backend
npm start
```

You should see in the console:
```
🌟 Using Adzuna API for real job listings
```

### Step 5: Test It Out!

1. Go to your frontend (usually http://localhost:5173)
2. Upload a resume or click "Try Demo"
3. Wait 3-5 seconds
4. You'll see REAL jobs from Adzuna!
5. Click "View Job" to go to actual job postings

## Verification Checklist

✅ Signed up for Adzuna account  
✅ Received Application ID and API Key  
✅ Added credentials to `backend/.env`  
✅ Set `USE_MOCK_SCRAPER=false`  
✅ Restarted backend server  
✅ See "🌟 Using Adzuna API" in console  
✅ Upload resume and see real jobs  

## What You Get

- **50 real jobs** per search
- **5,000 free API calls** per month
- **Actual job links** that work
- **Salary information** when available
- **Professional descriptions**
- **Multi-country support** (US, UK, CA, AU, etc.)

## Common Issues

### "Invalid Adzuna API credentials"

**Problem:** Wrong Application ID or API Key

**Solution:**
- Double-check credentials on https://developer.adzuna.com
- Make sure there are no extra spaces
- Verify `.env` file is in `/backend` directory
- Restart backend server

### Still seeing mock data

**Problem:** Environment variables not loaded

**Solution:**
- Make sure `.env` file exists in `backend/` folder
- Verify `USE_MOCK_SCRAPER=false` is set
- Restart backend: `Ctrl+C` then `npm start`
- Check console for "🌟 Using Adzuna API"

### "Failed to connect to Adzuna API"

**Problem:** Network or API issue

**Solution:**
- Check your internet connection
- Try again in a few minutes
- System will fallback to mock data automatically

## API Limits

### Free Tier
- **5,000 API calls per month**
- **50 jobs per call**
- **Rate limiting:** Automatic

### Usage Tips
- Each resume upload = 1 API call
- 5,000 calls = 5,000 resumes uploaded per month
- More than enough for personal/demo use

## Need Help?

1. Check `SCRAPER_CONFIGURATION.md` for detailed docs
2. Verify credentials at https://developer.adzuna.com
3. Check backend console for error messages
4. Make sure MongoDB is running

## Success!

Once configured, you have:
- ✅ Real job scraping
- ✅ Working job links
- ✅ Professional quality data
- ✅ Multi-country support
- ✅ 5,000 free monthly calls

**Enjoy your real job search automation! 🎉**


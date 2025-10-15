# Quick Start Guide - CV-Express

## ⚠️ Current Issues & Solutions

### Issue 1: Docker Hub Email Verification
Your Docker Hub account needs email verification before pulling images.

**Solution**: Use **MongoDB Atlas** (free cloud MongoDB) instead:

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account (no credit card needed)
3. Create a free cluster (M0 tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster...`)
6. Update `backend/.env`:
   ```
   MONGODB_URI=your-connection-string-here
   ```

### Issue 2: Node.js Architecture Mismatch
You're running Node under Rosetta (x86_64 emulation) which causes rollup issues.

**Solution**: Reinstall Node.js natively or run in x86 mode:

```bash
# Clean install frontend dependencies
cd /Users/diogoporto/Documents/CV-Express/CV-Express/frontend
rm -rf node_modules package-lock.json
arch -x86_64 npm install
```

## 🚀 Running the App (MongoDB Atlas)

Once you have your MongoDB Atlas connection string:

### Step 1: Update Environment
```bash
# Edit backend/.env and add your MongoDB Atlas connection string
# MONGODB_URI=mongodb+srv://your-connection-string
```

### Step 2: Start the Application
```bash
cd /Users/diogoporto/Documents/CV-Express/CV-Express

# Option A: Both servers together
npm run dev

# Option B: Separate terminals
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### Step 3: Access the App
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🔧 Alternative: Fix Docker Issue

If you want to use local MongoDB via Docker:

1. **Verify your Docker Hub email** (check your email inbox)
2. **Login to Docker Hub**:
   ```bash
   docker login
   ```
3. **Run MongoDB**:
   ```bash
   docker run -d --name cv-express-mongodb -p 27017:27017 mongo:latest
   ```
4. **Start the app**:
   ```bash
   npm run dev
   ```

## ✅ What to Do Right Now

**Easiest path** (5 minutes):

1. **Sign up for MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/register
2. **Create a free cluster** (follow the wizard)
3. **Get connection string** and update `backend/.env`
4. **Run**: `npm run dev`
5. **Open**: http://localhost:3000

That's it! 🎉


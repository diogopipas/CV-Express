# CV-Express Start Scripts Guide

This guide explains the different ways to start your CV-Express application with the new Resume Management feature.

## 🚀 Quick Start Options

### Option 1: Bash Script (Mac/Linux) - Recommended
```bash
./START-RESUME-FEATURE.sh
```

**Features:**
- ✅ Automatically checks and installs dependencies
- ✅ Creates uploads directory
- ✅ Starts both backend and frontend servers
- ✅ Shows live logs
- ✅ Beautiful colored output
- ✅ Easy cleanup with Ctrl+C

### Option 2: Batch File (Windows)
```cmd
START-RESUME-FEATURE.bat
```

**Features:**
- ✅ Checks and installs dependencies
- ✅ Creates uploads directory
- ✅ Opens servers in separate windows
- ✅ Auto-opens browser
- ✅ Easy to stop (close windows)

### Option 3: NPM Scripts (Cross-platform)
```bash
npm run dev
```

**Features:**
- ✅ Uses concurrently to run both servers
- ✅ Single command
- ✅ Cross-platform compatible
- ✅ Standard npm workflow

### Option 4: Manual Start (Development)
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**When to use:**
- Debugging specific server
- Need separate terminal control
- Development with hot reload

---

## 📋 Prerequisites

### Required Software
1. **Node.js** v18+ 
   ```bash
   node --version  # Should be 18.x or higher
   ```

2. **MongoDB**
   ```bash
   # Mac (Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

3. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

### First Time Setup
```bash
# Install all dependencies
npm run install:all

# Or install separately
cd backend && npm install
cd ../frontend && npm install
```

---

## 🎯 Using the Bash Script (Mac/Linux)

### Make Executable (First Time Only)
```bash
chmod +x START-RESUME-FEATURE.sh
```

### Run the Script
```bash
./START-RESUME-FEATURE.sh
```

### What It Does
1. ✅ Checks if dependencies are installed
2. ✅ Installs missing dependencies automatically
3. ✅ Checks if MongoDB is running (warns if not)
4. ✅ Creates `backend/uploads/` directory
5. ✅ Starts backend server on port 5001
6. ✅ Starts frontend server on port 5173
7. ✅ Displays application URLs
8. ✅ Shows helpful tips and features
9. ✅ Tails logs from both servers

### Output Example
```
🚀 Starting CV-Express with Resume Management Feature...

✅ Backend dependencies installed
✅ Frontend dependencies installed
✅ Created uploads directory

📦 Starting Backend Server...
🎨 Starting Frontend Server...

✅ Servers are starting up!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Application URLs:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🌐 Frontend:  http://localhost:5173
  🔌 Backend:   http://localhost:5001
  💚 Health:    http://localhost:5001/health
  
Press Ctrl+C to stop all servers
```

### Stop the Servers
Simply press `Ctrl+C` in the terminal. The script will cleanly shutdown both servers.

---

## 🪟 Using the Batch File (Windows)

### Run the Script
```cmd
START-RESUME-FEATURE.bat
```

Or double-click the file in Windows Explorer.

### What It Does
1. ✅ Checks and installs dependencies
2. ✅ Creates uploads directory
3. ✅ Opens backend server in new window
4. ✅ Opens frontend server in new window
5. ✅ Displays application info
6. ✅ Auto-opens browser to http://localhost:5173

### Stop the Servers
Close the backend and frontend command windows.

---

## 📦 Using NPM Scripts

### Start Both Servers
```bash
npm run dev
```

This uses `concurrently` to run both servers in parallel.

### Start Servers Individually
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

### Build for Production
```bash
# Build both
npm run build

# Build individually
npm run build:backend
npm run build:frontend
```

---

## 🔧 Troubleshooting

### Port Already in Use

**Error:** `Port 5001 already in use`

**Solution:**
```bash
# Find and kill process on port 5001
lsof -ti:5001 | xargs kill

# Or use different port in backend/.env
PORT=5002
```

**Error:** `Port 5173 already in use`

**Solution:**
```bash
# Find and kill process on port 5173
lsof -ti:5173 | xargs kill
```

### MongoDB Not Running

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
```bash
# Mac (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Check if running
mongosh
```

### Dependencies Not Installing

**Error:** `npm install` fails

**Solution:**
```bash
# Clear cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Permission Denied (Mac/Linux)

**Error:** `Permission denied: ./START-RESUME-FEATURE.sh`

**Solution:**
```bash
chmod +x START-RESUME-FEATURE.sh
```

### Uploads Directory Issues

**Error:** Cannot create uploads directory

**Solution:**
```bash
# Manually create directory
mkdir -p backend/uploads
chmod 755 backend/uploads
```

---

## 📊 Verifying Everything Works

### 1. Check Backend
```bash
curl http://localhost:5001/health
```

**Expected Response:**
```json
{"status":"OK","message":"CV-Express API is running"}
```

### 2. Check Frontend
Open browser to: http://localhost:5173

**Expected:** CV-Express homepage with navbar

### 3. Test Resume Upload
1. Click "Upload Resume" button (cyan, top-right)
2. Upload a PDF file
3. Navigate to "My Resumes"
4. See uploaded resume with extracted skills

---

## 🎯 Development Workflow

### Recommended Workflow
```bash
# 1. Start servers with script
./START-RESUME-FEATURE.sh

# 2. Open in browser
# Auto-opens to http://localhost:5173

# 3. Make code changes
# Both servers have hot reload enabled

# 4. View logs
tail -f backend.log
tail -f frontend.log

# 5. Stop when done
# Press Ctrl+C
```

### Alternative Workflow (Manual)
```bash
# Terminal 1 - MongoDB
mongod

# Terminal 2 - Backend
cd backend
npm run dev

# Terminal 3 - Frontend
cd frontend
npm run dev

# Terminal 4 - Logs/Testing
tail -f backend/logs/*.log
```

---

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/cv-express
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001/api
```

---

## 🚨 Common Issues

### Issue: Backend crashes on start

**Check:**
1. MongoDB is running
2. Port 5001 is available
3. Dependencies are installed
4. `.env` file exists

**Debug:**
```bash
cd backend
npm run dev
# Read error messages
```

### Issue: Frontend white screen

**Check:**
1. Backend is running
2. API URL is correct in `.env`
3. Dependencies are installed

**Debug:**
```bash
# Open browser console (F12)
# Check for errors
```

### Issue: Resume upload fails

**Check:**
1. Uploads directory exists: `backend/uploads/`
2. Directory has write permissions
3. File size under 10MB
4. File type is PDF/DOC/DOCX

**Debug:**
```bash
ls -la backend/uploads/
# Should be writable
```

---

## 📚 Additional Resources

### Documentation
- `CV_UPLOAD_FEATURE.md` - Technical docs
- `RESUME_FEATURE_QUICKSTART.md` - User guide
- `QUICK_REFERENCE.md` - Developer reference
- `IMPLEMENTATION_COMPLETE.md` - Feature summary

### Logs
- Backend logs: `backend.log`
- Frontend logs: `frontend.log`
- MongoDB logs: Check MongoDB data directory

### Useful Commands
```bash
# View all running Node processes
ps aux | grep node

# Check ports in use
lsof -i :5001
lsof -i :5173

# Monitor MongoDB
mongosh
> show dbs
> use cv-express
> db.resumes.find()
```

---

## 🎉 Success Checklist

After starting the application, verify:

- [ ] Backend running on http://localhost:5001
- [ ] Frontend running on http://localhost:5173
- [ ] MongoDB connected (no errors in backend log)
- [ ] Can access homepage
- [ ] "Upload Resume" button visible in navbar
- [ ] "My Resumes" link in navbar
- [ ] Can upload a test PDF
- [ ] Skills extracted from PDF
- [ ] Resume appears on "My Resumes" page
- [ ] No console errors in browser

---

## 💡 Pro Tips

1. **Use the bash script** for quickest startup
2. **Keep MongoDB running** in background
3. **Check logs** if something doesn't work
4. **Clear browser cache** if UI doesn't update
5. **Use different terminals** for better control
6. **Monitor uploads folder** during testing

---

## 🆘 Need Help?

If you encounter issues:

1. **Check this README** first
2. **View the logs** (backend.log, frontend.log)
3. **Verify MongoDB** is running
4. **Check documentation** files
5. **Review error messages** carefully
6. **Test endpoints** with curl/Postman

---

**Happy Coding! 🚀**

The Resume Management feature is ready to revolutionize your job search!


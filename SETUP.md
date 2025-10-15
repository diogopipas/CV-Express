# Setup Guide

This guide will help you set up the CV-Express job scraper application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - Either:
  - Local installation - [Download](https://www.mongodb.com/try/download/community)
  - MongoDB Atlas (cloud) - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd CV-Express
```

### 2. Install Dependencies

#### Option A: Install All at Once (Recommended)
```bash
npm run install:all
```

#### Option B: Install Manually
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Set Up MongoDB

#### Local MongoDB:
1. Start MongoDB service:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows
   net start MongoDB
   ```

#### MongoDB Atlas (Cloud):
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/cv-express`)

### 4. Configure Environment Variables

#### Backend Configuration:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cv-express
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cv-express
NODE_ENV=development
```

#### Frontend Configuration (Optional):
Create `frontend/.env` if you need to customize the API URL:
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Start the Application

#### Option A: Run Both Servers Together
```bash
npm run dev
```

#### Option B: Run Servers Separately

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 6. Access the Application

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)
- Health Check: [http://localhost:5000/health](http://localhost:5000/health)

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongoNetworkError: connect ECONNREFUSED"**
- Ensure MongoDB is running
- Check your MONGODB_URI in `.env`
- For local MongoDB, verify it's running on port 27017

**Error: "Authentication failed"**
- Check username and password in MongoDB Atlas connection string
- Ensure IP address is whitelisted in Atlas (or use 0.0.0.0/0 for development)

### Port Already in Use

**Error: "Port 5000 already in use"**
```bash
# Find and kill the process (macOS/Linux)
lsof -ti:5000 | xargs kill -9

# Or change the port in backend/.env
PORT=5001
```

**Error: "Port 3000 already in use"**
```bash
# Change port in frontend
# Vite will automatically suggest an alternative port
```

### Puppeteer Issues

**Error: "Chromium did not download properly"**
```bash
cd backend
npm rebuild puppeteer
```

**Linux-specific Chromium dependencies:**
```bash
sudo apt-get install -y chromium-browser
# OR
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
```

### TypeScript Errors

If you see TypeScript errors:
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Production Build

### Build for Production:
```bash
npm run build
```

### Run Production Build:

Backend:
```bash
cd backend
npm start
```

Frontend (serve with a static server):
```bash
cd frontend
npm run preview
# OR use a production server like nginx, Apache, or Vercel
```

## Next Steps

1. Open [http://localhost:3000](http://localhost:3000)
2. Try searching for a job (e.g., "Software Engineer" in "San Francisco")
3. Browse the results
4. Save jobs you're interested in
5. View your saved jobs in the "Saved Jobs" page

## Need Help?

- Check the main [README.md](README.md) for feature documentation
- Review [backend/README.md](backend/README.md) for API details
- Review [frontend/README.md](frontend/README.md) for UI component info

Happy job hunting! 🚀


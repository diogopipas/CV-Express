# 🚀 How to Start CV-Express

Choose your preferred method to start the application:

---

## ⚡ Super Quick Start (Easiest)

```bash
./start.sh
```

**One command. That's it!** ✨

---

## 🎨 Feature-Rich Start (Recommended)

```bash
./START-RESUME-FEATURE.sh
```

**Includes:**
- ✅ Dependency checking
- ✅ Beautiful colored output
- ✅ Live logs
- ✅ Feature tips
- ✅ Health checks

---

## 📦 NPM Start (Standard)

```bash
npm run dev
```

**Simple. Clean. Reliable.** 

Uses concurrently to run both servers.

---

## 🪟 Windows Users

```cmd
START-RESUME-FEATURE.bat
```

**Features:**
- Opens servers in separate windows
- Auto-opens browser
- Easy to stop

---

## 🛠️ Manual Start (Development)

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

**Best for:** Debugging, development with separate control

---

## 📍 Access Points

After starting, visit:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001
- **Health Check:** http://localhost:5001/health

---

## ✨ New Resume Features

Once running:

1. **Upload Resume** - Click cyan button in navbar
2. **View Dashboard** - Navigate to "My Resumes"
3. **Track Progress** - See application statistics
4. **AI Extraction** - Automatic skill detection

---

## 🆘 Troubleshooting

### MongoDB Not Running?
```bash
brew services start mongodb-community
```

### Port Already in Use?
```bash
lsof -ti:5001 | xargs kill  # Backend
lsof -ti:5173 | xargs kill  # Frontend
```

### Dependencies Missing?
```bash
npm run install:all
```

---

## 📚 More Help

- **Detailed Guide:** `START_SCRIPTS_README.md`
- **User Guide:** `RESUME_FEATURE_QUICKSTART.md`
- **Quick Reference:** `QUICK_REFERENCE.md`

---

**Happy Job Hunting! 🎯**


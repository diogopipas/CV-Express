@echo off
REM CV-Express Start Script for Windows with Resume Feature

echo.
echo ====================================================
echo    CV-Express - Job Search with Resume Management
echo ====================================================
echo.

REM Check if node_modules exists in backend
if not exist "backend\node_modules" (
    echo [!] Backend dependencies not installed. Installing...
    cd backend
    call npm install
    cd ..
    echo [+] Backend dependencies installed
    echo.
)

REM Check if node_modules exists in frontend
if not exist "frontend\node_modules" (
    echo [!] Frontend dependencies not installed. Installing...
    cd frontend
    call npm install
    cd ..
    echo [+] Frontend dependencies installed
    echo.
)

REM Create uploads directory if it doesn't exist
if not exist "backend\uploads" (
    mkdir backend\uploads
    echo [+] Created uploads directory
    echo.
)

echo ====================================================
echo    Starting Servers...
echo ====================================================
echo.

REM Start backend server in new window
echo [*] Starting Backend Server (Port 5001)...
start "CV-Express Backend" cmd /k "cd backend && npm run dev"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start frontend server in new window
echo [*] Starting Frontend Server (Port 5173)...
start "CV-Express Frontend" cmd /k "cd frontend && npm run dev"

REM Wait for servers to start
timeout /t 3 /nobreak >nul

echo.
echo ====================================================
echo    Servers Started Successfully!
echo ====================================================
echo.
echo    Frontend:  http://localhost:5173
echo    Backend:   http://localhost:5001
echo    Health:    http://localhost:5001/health
echo.
echo ====================================================
echo    New Resume Features Available:
echo ====================================================
echo.
echo    [1] Upload Resume    - Click 'Upload Resume' button
echo    [2] View Dashboard   - Navigate to 'My Resumes'
echo    [3] AI Features      - Automatic skill extraction
echo    [4] Track Progress   - Monitor applications
echo.
echo ====================================================
echo    Quick Tips:
echo ====================================================
echo.
echo    * Upload PDF resumes for best skill extraction
echo    * Supported: PDF, DOC, DOCX (max 10MB)
echo    * FREE plan: 1 search per resume, 3 uploads
echo    * PRO plan: Unlimited searches, 10 uploads
echo.
echo ====================================================
echo.
echo Press any key to open the application in your browser...
pause >nul

REM Open browser
start http://localhost:5173

echo.
echo Application opened in browser!
echo.
echo To stop servers, close the backend and frontend windows.
echo.
pause


#!/bin/bash

# CV-Express Start Script with Resume Feature
# This script starts both backend and frontend servers

echo "🚀 Starting CV-Express with Resume Management Feature..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node_modules exists in backend
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Backend dependencies not installed. Installing...${NC}"
    cd backend && npm install && cd ..
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
    echo ""
fi

# Check if node_modules exists in frontend
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend dependencies not installed. Installing...${NC}"
    cd frontend && npm install && cd ..
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
    echo ""
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB doesn't appear to be running${NC}"
    echo -e "${CYAN}💡 Tip: Start MongoDB with: brew services start mongodb-community${NC}"
    echo ""
fi

# Create uploads directory if it doesn't exist
if [ ! -d "backend/uploads" ]; then
    mkdir -p backend/uploads
    echo -e "${GREEN}✅ Created uploads directory${NC}"
    echo ""
fi

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend server
echo -e "${BLUE}📦 Starting Backend Server...${NC}"
cd backend && npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo -e "${CYAN}🎨 Starting Frontend Server...${NC}"
cd frontend && npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 3

echo ""
echo -e "${GREEN}✅ Servers are starting up!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${CYAN}📍 Application URLs:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "  🌐 Frontend:  ${GREEN}http://localhost:5173${NC}"
echo -e "  🔌 Backend:   ${GREEN}http://localhost:5001${NC}"
echo -e "  💚 Health:    ${GREEN}http://localhost:5001/health${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${CYAN}✨ New Resume Features:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "  📤 Upload Resume    → Click ${CYAN}'Upload Resume'${NC} button in navbar"
echo -e "  📊 View Dashboard   → Navigate to ${CYAN}'My Resumes'${NC}"
echo -e "  🤖 AI Features      → Automatic skill extraction from PDFs"
echo -e "  📈 Track Progress   → Monitor application statistics"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${CYAN}📝 Quick Tips:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  1. Upload a PDF resume for best skill extraction"
echo "  2. Supported formats: PDF, DOC, DOCX (max 10MB)"
echo "  3. View extracted skills and job suggestions"
echo "  4. Track your job applications in real-time"
echo "  5. FREE plan: 1 search per resume, 3 uploads"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}📋 Logs:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "  Backend:  ${BLUE}tail -f backend.log${NC}"
echo -e "  Frontend: ${BLUE}tail -f frontend.log${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Show live logs
tail -f backend.log frontend.log 2>/dev/null &

# Wait for processes
wait


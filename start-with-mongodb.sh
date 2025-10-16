#!/bin/bash

# CV-Express Startup Script with MongoDB Check
# This script helps start the application and MongoDB

set -e

echo "🚀 CV-Express Startup Script"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if MongoDB is running
check_mongodb() {
    if lsof -Pi :27017 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✓ MongoDB is running on port 27017${NC}"
        return 0
    else
        echo -e "${RED}✗ MongoDB is NOT running${NC}"
        return 1
    fi
}

# Function to try starting MongoDB via Docker
start_mongodb_docker() {
    echo "Attempting to start MongoDB via Docker..."
    
    # Check if container already exists
    if docker ps -a --format '{{.Names}}' | grep -q '^mongodb-cv-express$'; then
        echo "Found existing MongoDB container, starting it..."
        docker start mongodb-cv-express
        sleep 3
        return 0
    else
        echo "Creating new MongoDB container..."
        docker run -d \
          -p 27017:27017 \
          --name mongodb-cv-express \
          -e MONGO_INITDB_DATABASE=cv-express \
          mongo:latest 2>/dev/null || mongo:7.0 2>/dev/null || mongo 2>/dev/null
        sleep 3
        return 0
    fi
}

# Main script
echo "Step 1: Checking MongoDB status..."
if ! check_mongodb; then
    echo ""
    echo -e "${YELLOW}MongoDB is not running. Trying to start it...${NC}"
    echo ""
    
    # Try Docker first
    if command -v docker &> /dev/null; then
        if docker ps &> /dev/null; then
            if start_mongodb_docker; then
                sleep 2
                if check_mongodb; then
                    echo -e "${GREEN}✓ MongoDB started successfully via Docker!${NC}"
                fi
            fi
        else
            echo -e "${YELLOW}⚠ Docker is installed but not running${NC}"
        fi
    fi
    
    # If still not running, provide instructions
    if ! check_mongodb; then
        echo ""
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${RED}  MongoDB Setup Required  ${NC}"
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "Please choose one option:"
        echo ""
        echo "Option 1: MongoDB Atlas (Cloud - Easiest)"
        echo "  1. Go to https://www.mongodb.com/cloud/atlas"
        echo "  2. Create a free account and cluster"
        echo "  3. Get your connection string"
        echo "  4. Update backend/.env with:"
        echo "     MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cv-express"
        echo ""
        echo "Option 2: Docker (if Docker Desktop is running)"
        echo "  docker run -d -p 27017:27017 --name mongodb-cv-express mongo"
        echo ""
        echo "Option 3: Local Installation"
        echo "  macOS: brew install mongodb-community"
        echo "  Linux: sudo apt-get install mongodb"
        echo "  Windows: Download from mongodb.com"
        echo ""
        echo -e "${YELLOW}See MONGODB_SETUP_FIX.md for detailed instructions${NC}"
        echo ""
        exit 1
    fi
fi

echo ""
echo "Step 2: Cleaning up old processes..."
pkill -9 -f "nodemon" 2>/dev/null || true
pkill -9 -f "ts-node" 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

echo ""
echo "Step 3: Starting CV-Express..."
cd "$(dirname "$0")"
npm run dev

echo ""
echo -e "${GREEN}✓ Application started!${NC}"
echo ""
echo "Access points:"
echo "  • Frontend: http://localhost:3001 (or port shown above)"
echo "  • Backend:  http://localhost:5000"
echo "  • Health:   http://localhost:5000/health"
echo ""


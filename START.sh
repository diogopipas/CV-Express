#!/bin/bash

echo "==================================="
echo "  CV-Express - Starting Application"
echo "==================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "Node version: $(node --version)"
echo ""

# Check if MongoDB is running
echo "Checking MongoDB connection..."
if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    echo "Warning: MongoDB client not found. Make sure MongoDB is running or use MongoDB Atlas."
    echo "Continuing anyway..."
fi
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "Installing dependencies..."
    npm run install:all
    echo ""
fi

# Check if backend/.env exists
if [ ! -f "backend/.env" ]; then
    echo "Warning: backend/.env file not found!"
    echo "Please create backend/.env with your MongoDB connection string:"
    echo "  MONGODB_URI=mongodb://localhost:27017/cv-express"
    echo "  PORT=5000"
    echo ""
    read -p "Press Enter to continue anyway or Ctrl+C to exit..."
fi

# Start the application
echo "Starting CV-Express..."
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

npm run dev


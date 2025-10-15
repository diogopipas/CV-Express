#!/bin/bash

# CV-Express Quick Start Script

echo "🚀 Starting CV-Express Job Scraper..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    echo "   Then run this script again."
    exit 1
fi

# Check if MongoDB container exists
if ! docker ps -a --format '{{.Names}}' | grep -q '^cv-express-mongodb$'; then
    echo "📦 Creating MongoDB container..."
    docker run -d --name cv-express-mongodb -p 27017:27017 mongo:latest
    echo "⏳ Waiting for MongoDB to start..."
    sleep 5
else
    # Check if container is stopped
    if ! docker ps --format '{{.Names}}' | grep -q '^cv-express-mongodb$'; then
        echo "▶️  Starting existing MongoDB container..."
        docker start cv-express-mongodb
        sleep 3
    else
        echo "✅ MongoDB container already running"
    fi
fi

echo ""
echo "✅ MongoDB is ready!"
echo ""
echo "🌐 Starting application..."
echo "   - Frontend: http://localhost:3000"
echo "   - Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the servers"
echo ""

# Start both servers
npm run dev


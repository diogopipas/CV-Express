#!/bin/bash

echo "🚀 CV-Express Simple Starter"
echo ""
echo "⚠️  IMPORTANT: Before running this script:"
echo ""
echo "1. Set up MongoDB Atlas (5 minutes):"
echo "   → Go to: https://www.mongodb.com/cloud/atlas/register"
echo "   → Create free account & cluster"
echo "   → Get connection string"
echo "   → Update backend/.env with your connection string"
echo ""
echo "2. Verify backend/.env has your MongoDB connection:"
echo "   MONGODB_URI=mongodb+srv://your-connection-string"
echo ""
read -p "Press Enter when MongoDB is configured (or Ctrl+C to exit)..."

# Check if MongoDB URI is set
if grep -q "mongodb://localhost" backend/.env; then
    echo ""
    echo "⚠️  WARNING: Still using localhost MongoDB!"
    echo "   Either:"
    echo "   - Update backend/.env with MongoDB Atlas connection string, OR"
    echo "   - Verify Docker Hub email and run: docker run -d -p 27017:27017 mongo"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Kill any process on port 5000
echo "🧹 Cleaning up..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo ""
echo "✅ Starting servers..."
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📝 To stop: Press Ctrl+C"
echo ""

# Start both servers
npm run dev


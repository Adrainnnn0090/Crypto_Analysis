#!/bin/bash

# Simple API Server for Jarvis Dashboard
echo "🚀 Starting Simple Jarvis Dashboard API..."
cd /home/admin/clawd

# Kill any existing processes on port 3001
if command -v lsof &> /dev/null; then
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
fi

# Start the simple server
node api/simple-server.js &

# Wait a moment and check if it's running
sleep 2
if lsof -i :3001 &> /dev/null; then
    echo "✅ Simple Jarvis Dashboard API is running on http://localhost:3001"
    echo "📊 Dashboard HTML: file:///home/admin/clawd/jarvis-realtime-dashboard.html"
    echo ""
    echo "🎉 Simple deployment completed successfully!"
else
    echo "❌ Failed to start Simple Jarvis Dashboard API"
    echo "Check the console output above for errors"
    exit 1
fi
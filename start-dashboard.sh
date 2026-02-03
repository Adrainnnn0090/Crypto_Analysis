#!/bin/bash

echo "🚀 Starting Crypto Analysis Dashboard..."

# Kill any existing processes on port 3000
echo "🧹 Cleaning up existing processes..."
pkill -f "node.*simple-server.js" 2>/dev/null
pkill -f "node.*realtime_runner.js" 2>/dev/null
pkill -f "node.*price_runner.js" 2>/dev/null

# Create data directory if it doesn't exist
mkdir -p data

# Ensure data files exist
if [ ! -f "data/bitcoin_news.json" ]; then
    echo '{"articles": [], "lastUpdated": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > data/bitcoin_news.json
fi

if [ ! -f "data/ethereum_news.json" ]; then
    echo '{"articles": [], "lastUpdated": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > data/ethereum_news.json
fi

if [ ! -f "data/bitcoin_technical.json" ]; then
    echo '{"indicators": {}, "lastUpdated": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > data/bitcoin_technical.json
fi

if [ ! -f "data/ethereum_technical.json" ]; then
    echo '{"indicators": {}, "lastUpdated": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > data/ethereum_technical.json
fi

# Start the server
echo "⚙️  Starting server on http://localhost:3000"
node simple-server.js &

# Start realtime scraper (runs in background)
echo "📰 Starting realtime news scraper..."
node scrapers/realtime_runner.js &

# Start price updater (runs in background)
echo "💰 Starting price updater (30s interval)..."
node scrapers/price_runner.js &

# Wait a moment and check if it's running
sleep 2
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Dashboard is running successfully!"
    echo "🌐 Open http://localhost:3000 in your browser"
    echo "📊 API endpoints:"
    echo "   - /api/news/bitcoin"
    echo "   - /api/news/ethereum" 
    echo "   - /api/technical/bitcoin"
    echo "   - /api/technical/ethereum"
else
    echo "❌ Failed to start dashboard"
    exit 1
fi

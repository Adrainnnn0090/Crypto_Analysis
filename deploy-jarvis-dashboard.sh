#!/bin/bash

# Jarvis Real-time Dashboard Deployment Script

set -e

echo "🚀 Deploying Jarvis Real-time Dashboard API..."

# 创建必要的目录
mkdir -p /home/admin/clawd/api
mkdir -p /home/admin/clawd/data
mkdir -p /home/admin/clawd/logs

# 设置权限
chmod +x /home/admin/clawd/start-dashboard-api.sh

# 检查Node.js版本
NODE_VERSION=$(node --version)
echo "Node.js version: $NODE_VERSION"

# 安装必要的依赖（如果需要）
if [ ! -f "/home/admin/clawd/package.json" ]; then
    echo "Creating package.json..."
    cat > /home/admin/clawd/package.json << EOF
{
  "name": "jarvis-dashboard",
  "version": "1.0.0",
  "description": "Real-time dashboard for Jarvis AI assistant",
  "main": "api/server.js",
  "scripts": {
    "start": "node api/server.js",
    "dev": "nodemon api/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF
fi

# 安装依赖
if [ ! -d "/home/admin/clawd/node_modules" ]; then
    echo "Installing dependencies..."
    npm install --silent
fi

# 创建日志目录
mkdir -p /home/admin/clawd/logs

# 启动API服务器
echo "Starting Jarvis Dashboard API server..."
nohup node /home/admin/clawd/api/server.js > /home/admin/clawd/logs/dashboard.log 2>&1 &

# 等待几秒让服务器启动
sleep 3

# 检查服务器是否正常运行
if lsof -i :3001 > /dev/null; then
    echo "✅ Jarvis Dashboard API is running on http://localhost:3001"
    echo "📊 Dashboard HTML: file:///home/admin/clawd/jarvis-realtime-dashboard.html"
    echo "📋 Logs: /home/admin/clawd/logs/dashboard.log"
else
    echo "❌ Failed to start Jarvis Dashboard API"
    echo "Check logs in /home/admin/clawd/logs/dashboard.log"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "To access the dashboard:"
echo "1. Open jarvis-realtime-dashboard.html in your browser"
echo "2. The dashboard will automatically connect to the API at http://localhost:3001"
echo ""
echo "API Endpoints:"
echo "  GET  /api/jarvis/status          - Get current session status"
echo "  GET  /api/jarvis/sessions        - List all sessions"
echo "  POST /api/jarvis/sessions/:key/pause - Pause a session"
echo "  POST /api/jarvis/sessions/:key/terminate - Terminate a session"
echo "  GET  /api/jarvis/history         - Get session history"
echo "  GET  /api/jarvis/performance     - Get performance metrics"
echo "  GET  /api/jarvis/notifications   - Get notifications"
echo "  POST /api/jarvis/notifications/mark-read - Mark notifications as read"
// server.js - Jarvis Dashboard API Server
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

// 导入功能模块
const dashboardRoutes = require('./routes');
const taskManager = require('./task-manager');
const performanceAnalyzer = require('./performance-analyzer');
const notificationSystem = require('./notification-system');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API路由（必须在静态文件之前）
app.use('/api', dashboardRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 静态文件服务（只在最后）
app.use(express.static(path.join(__dirname, '..')));

// 主页重定向到仪表板
app.get('/', (req, res) => {
    res.redirect('/jarvis-realtime-dashboard.html');
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'An unexpected error occurred'
    });
});

// 404处理
app.use('*', (req, res) => {
    // 如果是API请求，返回JSON错误
    if (req.originalUrl.startsWith('/api')) {
        res.status(404).json({
            error: 'Not Found',
            message: `API endpoint ${req.originalUrl} not found`
        });
    } else {
        // 否则尝试提供静态文件或返回404页面
        res.status(404).send('Page not found');
    }
});

// 启动服务器
async function startServer() {
    try {
        // 确保数据目录存在
        await fs.mkdir(path.join(__dirname, '..', 'data'), { recursive: true }).catch(() => {});
        
        // 初始化通知系统
        await notificationSystem.initialize();
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Jarvis Dashboard API Server running on port ${PORT}`);
            console.log(`📊 Dashboard available at http://localhost:${PORT}/jarvis-realtime-dashboard.html`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// 处理优雅关闭
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

// 启动服务器
startServer();

module.exports = app;
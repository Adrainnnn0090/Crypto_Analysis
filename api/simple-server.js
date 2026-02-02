// simple-server.js - Simple HTTP server for Jarvis Dashboard API
const http = require('http');
const url = require('url');
const fs = require('fs').promises;
const path = require('path');

// Import our API modules
const { JarvisDashboardAPI } = require('./jarvis-dashboard');
const notificationSystem = require('./notification-system');

class SimpleAPIServer {
    constructor() {
        this.api = new JarvisDashboardAPI();
        this.port = process.env.PORT || 3001;
        this.server = null;
    }

    async initialize() {
        await this.api.initialize();
        await notificationSystem.initialize();
    }

    async handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        try {
            // Health check
            if (pathname === '/health' && req.method === 'GET') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime()
                }));
                return;
            }

            // API routes
            if (pathname.startsWith('/api/')) {
                if (pathname === '/api/jarvis/status' && req.method === 'GET') {
                    const data = await this.api.getStatusData();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(data));
                    return;
                }

                if (pathname === '/api/jarvis/sessions' && req.method === 'GET') {
                    const data = await this.api.getStatusData();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ sessions: data.sessions }));
                    return;
                }

                if (pathname.startsWith('/api/jarvis/sessions/') && req.method === 'POST') {
                    const sessionKey = pathname.split('/')[4];
                    const action = pathname.split('/')[5];
                    
                    if (action === 'pause') {
                        // Pause session logic would go here
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: `Session ${sessionKey} paused` }));
                        return;
                    }
                    
                    if (action === 'terminate') {
                        // Terminate session logic would go here
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: `Session ${sessionKey} terminated` }));
                        return;
                    }
                }

                if (pathname === '/api/jarvis/history' && req.method === 'GET') {
                    const history = await this.api.getSessionHistory();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ history }));
                    return;
                }

                if (pathname === '/api/jarvis/performance' && req.method === 'GET') {
                    const metrics = await this.api.getPerformanceMetrics();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(metrics));
                    return;
                }

                if (pathname === '/api/jarvis/notifications' && req.method === 'GET') {
                    const notifications = notificationSystem.getNotifications(1, 20);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(notifications));
                    return;
                }

                if (pathname === '/api/jarvis/notifications/mark-read' && req.method === 'POST') {
                    const count = await notificationSystem.markAllAsRead();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, markedRead: count }));
                    return;
                }
            }

            // Serve static files
            if (pathname === '/' || pathname === '/jarvis-realtime-dashboard.html') {
                const filePath = path.join(__dirname, '..', 'jarvis-realtime-dashboard.html');
                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(content);
                    return;
                } catch (error) {
                    console.error('Error serving dashboard:', error);
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Dashboard file not found');
                    return;
                }
            }

            // 404 for everything else
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not Found', path: pathname }));

        } catch (error) {
            console.error('API Error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error', message: error.message }));
        }
    }

    start() {
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        this.server.listen(this.port, '0.0.0.0', () => {
            console.log(`🚀 Jarvis Dashboard Simple API Server running on port ${this.port}`);
            console.log(`📊 Dashboard available at http://localhost:${this.port}/jarvis-realtime-dashboard.html`);
        });

        // Handle graceful shutdown
        process.on('SIGTERM', () => {
            console.log('Received SIGTERM, shutting down gracefully...');
            this.server.close(() => process.exit(0));
        });

        process.on('SIGINT', () => {
            console.log('Received SIGINT, shutting down gracefully...');
            this.server.close(() => process.exit(0));
        });
    }
}

// Start the server
async function main() {
    try {
        const server = new SimpleAPIServer();
        await server.initialize();
        server.start();
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = SimpleAPIServer;
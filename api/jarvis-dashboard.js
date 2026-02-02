// jarvis-dashboard.js - Real API endpoint for Jarvis Dashboard
const fs = require('fs').promises;
const path = require('path');
const { SessionManager, PerformanceMonitor } = require('./moltbot-adapter');

class JarvisDashboardAPI {
    constructor() {
        this.sessionManager = new SessionManager();
        this.performanceMonitor = new PerformanceMonitor();
        this.dataDir = path.join(__dirname, '..', 'data');
        this.sessionsFile = path.join(this.dataDir, 'sessions.json');
        this.historyFile = path.join(this.dataDir, 'history.json');
    }

    async initialize() {
        await fs.mkdir(this.dataDir, { recursive: true }).catch(() => {});
        
        // 初始化会话文件
        try {
            await fs.access(this.sessionsFile);
        } catch {
            await fs.writeFile(this.sessionsFile, JSON.stringify({ sessions: [] }, null, 2));
        }
        
        // 初始化历史文件
        try {
            await fs.access(this.historyFile);
        } catch {
            await fs.writeFile(this.historyFile, JSON.stringify({ history: [] }, null, 2));
        }
    }

    // 获取实时状态数据
    async getStatusData() {
        try {
            // 获取当前会话列表
            const sessionsList = await this.sessionManager.getActiveSessions();
            
            // 获取系统状态
            const systemStatus = await this.performanceMonitor.getSystemStats();
            
            // 处理会话数据
            const processedSessions = sessionsList.map(session => ({
                key: session.key,
                kind: session.kind || 'unknown',
                channel: session.channel || 'unknown',
                label: session.label || session.key,
                status: session.status || 'active',
                tokens: session.tokens || 0,
                lastActivity: session.lastActivity || Date.now(),
                context: session.context || 'No context available',
                model: session.model || 'unknown'
            }));

            // 计算统计信息
            const stats = {
                activeSessions: processedSessions.filter(s => s.status === 'active').length,
                totalTokens: processedSessions.reduce((sum, session) => sum + session.tokens, 0),
                mainSession: processedSessions.some(s => s.kind === 'main') ? '✅' : '❌',
                subagents: processedSessions.filter(s => s.kind === 'subagent').length,
                totalSessions: processedSessions.length
            };

            // 系统信息
            const system = {
                model: systemStatus.model || 'unknown',
                workspace: '/home/admin/clawd',
                timezone: 'Asia/Shanghai',
                uptime: systemStatus.uptime || 'unknown'
            };

            return {
                sessions: processedSessions,
                stats: stats,
                system: system,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Error fetching status data:', error);
            return {
                sessions: [],
                stats: {
                    activeSessions: 0,
                    totalTokens: 0,
                    mainSession: '❌',
                    subagents: 0,
                    totalSessions: 0
                },
                system: {
                    model: 'error',
                    workspace: '/home/admin/clawd',
                    timezone: 'Asia/Shanghai',
                    uptime: 'unknown'
                },
                timestamp: Date.now(),
                error: error.message
            };
        }
    }

    // 获取会话历史
    async getSessionHistory(limit = 50) {
        try {
            const historyData = await fs.readFile(this.historyFile, 'utf8');
            const history = JSON.parse(historyData).history || [];
            
            // 返回最近的记录
            return history.slice(-limit).reverse();
        } catch (error) {
            console.error('Error reading history:', error);
            return [];
        }
    }

    // 保存会话快照（用于历史记录）
    async saveSessionSnapshot() {
        try {
            const currentData = await this.getStatusData();
            const snapshot = {
                timestamp: Date.now(),
                stats: currentData.stats,
                sessionCount: currentData.sessions.length
            };

            const historyData = await fs.readFile(this.historyFile, 'utf8');
            let history = JSON.parse(historyData).history || [];
            
            // 添加新快照
            history.push(snapshot);
            
            // 保持最多1000条记录
            if (history.length > 1000) {
                history = history.slice(-1000);
            }

            await fs.writeFile(this.historyFile, JSON.stringify({ history }, null, 2));
            return snapshot;
        } catch (error) {
            console.error('Error saving session snapshot:', error);
            return null;
        }
    }

    // 获取性能指标
    async getPerformanceMetrics() {
        try {
            const history = await this.getSessionHistory(100);
            if (history.length === 0) {
                return { metrics: {}, trends: {} };
            }

            // 计算平均值和趋势
            const totalTokens = history.reduce((sum, h) => sum + (h.stats?.totalTokens || 0), 0);
            const avgTokens = totalTokens / history.length;
            
            const activeSessions = history.reduce((sum, h) => sum + (h.stats?.activeSessions || 0), 0);
            const avgActiveSessions = activeSessions / history.length;

            // 趋势分析（比较最近10个点和之前的10个点）
            const recent = history.slice(-10);
            const previous = history.slice(-20, -10);
            
            const recentAvgTokens = recent.reduce((sum, h) => sum + (h.stats?.totalTokens || 0), 0) / recent.length;
            const previousAvgTokens = previous.reduce((sum, h) => sum + (h.stats?.totalTokens || 0), 0) / previous.length;
            
            const tokenTrend = recentAvgTokens > previousAvgTokens ? 'increasing' : 
                             recentAvgTokens < previousAvgTokens ? 'decreasing' : 'stable';

            return {
                metrics: {
                    averageTokens: Math.round(avgTokens),
                    averageActiveSessions: Math.round(avgActiveSessions),
                    peakTokens: Math.max(...history.map(h => h.stats?.totalTokens || 0)),
                    peakSessions: Math.max(...history.map(h => h.stats?.activeSessions || 0))
                },
                trends: {
                    tokenUsage: tokenTrend,
                    sessionActivity: 'stable' // 可以进一步分析
                },
                dataPoints: history.length
            };
        } catch (error) {
            console.error('Error calculating performance metrics:', error);
            return { metrics: {}, trends: {}, error: error.message };
        }
    }
}

// 导出类和实例
module.exports = {
    JarvisDashboardAPI,
    createInstance: () => new JarvisDashboardAPI()
};
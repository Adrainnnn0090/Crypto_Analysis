const fs = require('fs').promises;
const path = require('path');

class PerformanceAnalyzer {
    constructor() {
        this.historyDir = path.join(__dirname, '..', 'memory');
        this.performanceData = new Map();
    }

    // 获取会话历史记录
    async getSessionHistory(sessionKey, limit = 50) {
        try {
            const historyFile = path.join(this.historyDir, `${sessionKey}-history.json`);
            const exists = await fs.access(historyFile).then(() => true).catch(() => false);
            
            if (!exists) {
                return [];
            }
            
            const data = await fs.readFile(historyFile, 'utf8');
            const history = JSON.parse(data);
            return history.slice(-limit).reverse();
        } catch (error) {
            console.error(`Error reading history for ${sessionKey}:`, error);
            return [];
        }
    }

    // 记录会话性能数据
    async recordPerformance(sessionKey, performanceData) {
        try {
            const perfFile = path.join(this.historyDir, `${sessionKey}-performance.json`);
            const existingData = await this.getPerformanceData(sessionKey);
            
            const newData = {
                timestamp: Date.now(),
                ...performanceData
            };
            
            existingData.push(newData);
            
            // 只保留最近100条记录
            if (existingData.length > 100) {
                existingData.splice(0, existingData.length - 100);
            }
            
            await fs.writeFile(perfFile, JSON.stringify(existingData, null, 2));
        } catch (error) {
            console.error(`Error recording performance for ${sessionKey}:`, error);
        }
    }

    // 获取性能数据
    async getPerformanceData(sessionKey) {
        try {
            const perfFile = path.join(this.historyDir, `${sessionKey}-performance.json`);
            const exists = await fs.access(perfFile).then(() => true).catch(() => false);
            
            if (!exists) {
                return [];
            }
            
            const data = await fs.readFile(perfFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error reading performance data for ${sessionKey}:`, error);
            return [];
        }
    }

    // 获取性能统计摘要
    async getPerformanceSummary(sessionKey) {
        const perfData = await this.getPerformanceData(sessionKey);
        if (perfData.length === 0) {
            return null;
        }

        const tokens = perfData.map(d => d.tokens || 0);
        const responseTimes = perfData.map(d => d.responseTime || 0);
        const totalTokens = tokens.reduce((sum, t) => sum + t, 0);
        const avgResponseTime = responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length;

        return {
            totalSessions: perfData.length,
            totalTokens: totalTokens,
            averageResponseTime: Math.round(avgResponseTime),
            peakTokenUsage: Math.max(...tokens),
            lastActivity: perfData[perfData.length - 1].timestamp
        };
    }

    // 获取所有会话的性能概览
    async getAllPerformanceOverview() {
        try {
            const files = await fs.readdir(this.historyDir);
            const sessionKeys = new Set();
            
            // 提取所有会话键
            files.forEach(file => {
                if (file.endsWith('-performance.json')) {
                    const key = file.replace('-performance.json', '');
                    sessionKeys.add(key);
                }
            });

            const overview = {};
            for (const key of sessionKeys) {
                const summary = await this.getPerformanceSummary(key);
                if (summary) {
                    overview[key] = summary;
                }
            }
            
            return overview;
        } catch (error) {
            console.error('Error getting performance overview:', error);
            return {};
        }
    }

    // 清理旧的性能数据
    async cleanupOldData(days = 30) {
        try {
            const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
            const files = await fs.readdir(this.historyDir);
            
            for (const file of files) {
                if (file.includes('-performance.json') || file.includes('-history.json')) {
                    const filePath = path.join(this.historyDir, file);
                    const stats = await fs.stat(filePath);
                    
                    if (stats.mtime.getTime() < cutoff) {
                        await fs.unlink(filePath);
                        console.log(`Cleaned up old data file: ${file}`);
                    }
                }
            }
        } catch (error) {
            console.error('Error cleaning up old data:', error);
        }
    }
}

module.exports = new PerformanceAnalyzer();
// task-manager.js - Jarvis Dashboard Task Management
const path = require('path');
const fs = require('fs').promises;
const MoltbotAdapter = require('./moltbot-adapter');

class TaskManager {
    constructor() {
        this.adapter = new MoltbotAdapter();
        this.sessionFile = path.join(__dirname, '..', 'data', 'sessions.json');
    }

    async initialize() {
        await fs.mkdir(path.dirname(this.sessionFile), { recursive: true }).catch(() => {});
    }

    // 获取所有活跃会话
    async getActiveSessions() {
        try {
            const sessions = await this.adapter.getActiveSessions();
            return sessions.map(session => ({
                key: session.key,
                kind: session.kind,
                channel: session.channel,
                label: session.label || session.key,
                status: session.status || 'active',
                tokens: session.tokens || 0,
                lastActivity: session.lastActivity || Date.now(),
                context: session.context || 'Unknown context',
                thinking: session.thinking || false,
                model: session.model || 'unknown'
            }));
        } catch (error) {
            console.error('Failed to get active sessions:', error);
            return [];
        }
    }

    // 暂停特定会话
    async pauseSession(sessionKey) {
        try {
            // 对于Moltbot，暂停会话意味着停止处理新消息
            // 我们可以通过设置一个标志来实现
            const result = await this.adapter.pauseSession(sessionKey);
            return { success: true, message: `Session ${sessionKey} paused successfully` };
        } catch (error) {
            console.error('Failed to pause session:', error);
            return { success: false, message: `Failed to pause session: ${error.message}` };
        }
    }

    // 终止特定会话
    async terminateSession(sessionKey) {
        try {
            const result = await this.adapter.terminateSession(sessionKey);
            return { success: true, message: `Session ${sessionKey} terminated successfully` };
        } catch (error) {
            console.error('Failed to terminate session:', error);
            return { success: false, message: `Failed to terminate session: ${error.message}` };
        }
    }

    // 获取会话详细信息
    async getSessionDetails(sessionKey) {
        try {
            const details = await this.adapter.getSessionDetails(sessionKey);
            return details;
        } catch (error) {
            console.error('Failed to get session details:', error);
            return null;
        }
    }

    // 获取会话统计信息
    async getSessionStats() {
        try {
            const sessions = await this.getActiveSessions();
            const stats = {
                activeSessions: sessions.length,
                totalTokens: sessions.reduce((sum, session) => sum + (session.tokens || 0), 0),
                mainSession: sessions.some(s => s.kind === 'main') ? '✅' : '❌',
                subagents: sessions.filter(s => s.kind === 'subagent').length,
                thinkingSessions: sessions.filter(s => s.thinking).length
            };
            return stats;
        } catch (error) {
            console.error('Failed to get session stats:', error);
            return {
                activeSessions: 0,
                totalTokens: 0,
                mainSession: '❌',
                subagents: 0,
                thinkingSessions: 0
            };
        }
    }

    // 清理过期会话
    async cleanupExpiredSessions() {
        try {
            const result = await this.adapter.cleanupExpiredSessions();
            return result;
        } catch (error) {
            console.error('Failed to cleanup expired sessions:', error);
            return { success: false, message: error.message };
        }
    }
}

module.exports = TaskManager;
// notification-system.js - Jarvis Dashboard Notification System
const fs = require('fs').promises;
const path = require('path');

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.subscribers = new Set();
        this.notificationFile = path.join(__dirname, '..', 'data', 'notifications.json');
    }

    async initialize() {
        // 确保数据目录存在
        await fs.mkdir(path.dirname(this.notificationFile), { recursive: true }).catch(() => {});
        
        // 加载现有的通知
        try {
            const data = await fs.readFile(this.notificationFile, 'utf8');
            this.notifications = JSON.parse(data);
        } catch (error) {
            this.notifications = [];
        }
    }

    // 添加通知
    async addNotification(type, message, details = {}) {
        const notification = {
            id: Date.now().toString(),
            type: type, // 'task_start', 'task_complete', 'error', 'warning', 'info'
            message: message,
            timestamp: Date.now(),
            read: false,
            details: details
        };

        this.notifications.unshift(notification);
        
        // 保持最多1000条通知
        if (this.notifications.length > 1000) {
            this.notifications = this.notifications.slice(0, 1000);
        }

        // 保存到文件
        await this.saveNotifications();

        // 通知所有订阅者
        this.notifySubscribers(notification);

        return notification;
    }

    // 获取通知（可分页）
    getNotifications(page = 1, limit = 20, unreadOnly = false) {
        let filtered = this.notifications;
        
        if (unreadOnly) {
            filtered = filtered.filter(n => !n.read);
        }

        const start = (page - 1) * limit;
        const end = start + limit;
        
        return {
            notifications: filtered.slice(start, end),
            total: filtered.length,
            page: page,
            totalPages: Math.ceil(filtered.length / limit)
        };
    }

    // 标记通知为已读
    async markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            await this.saveNotifications();
            return true;
        }
        return false;
    }

    // 标记所有通知为已读
    async markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        await this.saveNotifications();
        return this.notifications.length;
    }

    // 删除通知
    async deleteNotification(notificationId) {
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            this.notifications.splice(index, 1);
            await this.saveNotifications();
            return true;
        }
        return false;
    }

    // 清除所有通知
    async clearAllNotifications() {
        this.notifications = [];
        await this.saveNotifications();
        return true;
    }

    // 订阅通知
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    // 通知所有订阅者
    notifySubscribers(notification) {
        this.subscribers.forEach(callback => {
            try {
                callback(notification);
            } catch (error) {
                console.error('Notification subscriber error:', error);
            }
        });
    }

    // 保存通知到文件
    async saveNotifications() {
        try {
            await fs.writeFile(this.notificationFile, JSON.stringify(this.notifications, null, 2));
        } catch (error) {
            console.error('Failed to save notifications:', error);
        }
    }

    // 获取未读通知计数
    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    // 获取最近的通知摘要
    getRecentSummary(hours = 24) {
        const cutoff = Date.now() - (hours * 60 * 60 * 1000);
        const recent = this.notifications.filter(n => n.timestamp >= cutoff);
        
        const summary = {
            total: recent.length,
            byType: {},
            unread: recent.filter(n => !n.read).length
        };

        recent.forEach(n => {
            summary.byType[n.type] = (summary.byType[n.type] || 0) + 1;
        });

        return summary;
    }
}

// 全局通知系统实例
const notificationSystem = new NotificationSystem();

// 初始化通知系统
notificationSystem.initialize().catch(console.error);

module.exports = notificationSystem;
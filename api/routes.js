// routes.js - Express routes for Jarvis Dashboard API
const express = require('express');
const router = express.Router();

// Import the dashboard controller
const dashboardController = require('./jarvis-dashboard');

// Define routes
router.get('/status', dashboardController.getStatus);
router.get('/sessions', dashboardController.getSessions);
router.post('/sessions/:sessionKey/pause', dashboardController.pauseSession);
router.post('/sessions/:sessionKey/terminate', dashboardController.terminateSession);
router.get('/history', dashboardController.getHistory);
router.get('/performance', dashboardController.getPerformance);
router.get('/notifications', dashboardController.getNotifications);
router.post('/notifications/mark-read', dashboardController.markNotificationsRead);

module.exports = router;
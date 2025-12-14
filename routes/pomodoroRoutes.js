// backend/routes/pomodoroRoutes.js
const express = require('express');
const pomodoroController = require('../controllers/pomodoroController');

const router = express.Router();

// Record a completed Pomodoro session
router.post('/pomodoro/session', pomodoroController.recordSession);

// Get Pomodoro statistics for a user
router.get('/pomodoro/stats', pomodoroController.getStats);

// Get recent Pomodoro sessions
router.get('/pomodoro/sessions', pomodoroController.getRecentSessions);

module.exports = router;


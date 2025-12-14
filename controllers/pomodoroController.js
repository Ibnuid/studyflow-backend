// backend/controllers/pomodoroController.js
const pomodoroModel = require('../models/pomodoroModel');

/**
 * Record a completed Pomodoro session
 */
async function recordSession(req, res) {
    try {
        const { user_id, mode } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required'
            });
        }

        const result = await pomodoroModel.recordSession(user_id, mode || 'work');
        const stats = await pomodoroModel.getStats(user_id);

        res.json({
            success: true,
            message: 'Pomodoro session recorded',
            session_id: result.id,
            stats: stats
        });
    } catch (error) {
        console.error('Error in recordSession:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record Pomodoro session',
            error: error.message
        });
    }
}

/**
 * Get Pomodoro statistics for a user
 */
async function getStats(req, res) {
    try {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required'
            });
        }

        const stats = await pomodoroModel.getStats(user_id);

        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('Error in getStats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get Pomodoro statistics',
            error: error.message
        });
    }
}

/**
 * Get recent Pomodoro sessions
 */
async function getRecentSessions(req, res) {
    try {
        const { user_id } = req.query;
        const limit = parseInt(req.query.limit) || 10;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required'
            });
        }

        const sessions = await pomodoroModel.getRecentSessions(user_id, limit);

        res.json({
            success: true,
            sessions: sessions
        });
    } catch (error) {
        console.error('Error in getRecentSessions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get recent Pomodoro sessions',
            error: error.message
        });
    }
}

module.exports = {
    recordSession,
    getStats,
    getRecentSessions
};


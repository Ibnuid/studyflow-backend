// backend/models/pomodoroModel.js
const pool = require('../db/index');

/**
 * Record a completed Pomodoro session
 */
async function recordSession(userId, mode = 'work') {
    try {
        const [result] = await pool.execute(
            `INSERT INTO pomodoro_sessions (user_id, mode, completed_at) 
             VALUES (?, ?, NOW())`,
            [userId, mode]
        );
        return { id: result.insertId, success: true };
    } catch (error) {
        console.error('Error recording Pomodoro session:', error);
        throw error;
    }
}

/**
 * Get statistics for a user
 */
async function getStats(userId) {
    try {
        // Get today's sessions
        const [todayRows] = await pool.execute(
            `SELECT COUNT(*) as count 
             FROM pomodoro_sessions 
             WHERE user_id = ? 
             AND DATE(completed_at) = CURDATE()`,
            [userId]
        );

        // Get total sessions
        const [totalRows] = await pool.execute(
            `SELECT COUNT(*) as count 
             FROM pomodoro_sessions 
             WHERE user_id = ?`,
            [userId]
        );

        // Get this week's sessions
        const [weekRows] = await pool.execute(
            `SELECT COUNT(*) as count 
             FROM pomodoro_sessions 
             WHERE user_id = ? 
             AND YEARWEEK(completed_at, 1) = YEARWEEK(CURDATE(), 1)`,
            [userId]
        );

        return {
            today_sessions: todayRows[0]?.count || 0,
            week_sessions: weekRows[0]?.count || 0,
            total_sessions: totalRows[0]?.count || 0
        };
    } catch (error) {
        console.error('Error getting Pomodoro stats:', error);
        throw error;
    }
}

/**
 * Get recent sessions for a user
 */
async function getRecentSessions(userId, limit = 10) {
    try {
        const [rows] = await pool.execute(
            `SELECT id, mode, completed_at 
             FROM pomodoro_sessions 
             WHERE user_id = ? 
             ORDER BY completed_at DESC 
             LIMIT ?`,
            [userId, limit]
        );
        return rows;
    } catch (error) {
        console.error('Error getting recent Pomodoro sessions:', error);
        throw error;
    }
}

module.exports = {
    recordSession,
    getStats,
    getRecentSessions
};


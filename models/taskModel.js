// backend/models/taskModel.js
const pool = require('../db/index');

/**
 * Create a new task
 */
async function create({ user_id, title, description, status, priority, due_date }) {
    try {
        const [result] = await pool.execute(
            `INSERT INTO user_tasks (user_id, title, description, status, priority, due_date) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, title, description || null, status || 'pending', priority || 'medium', due_date || null]
        );
        return { id: result.insertId, user_id, title, description, status: status || 'pending', priority: priority || 'medium', due_date };
    } catch (error) {
        console.error('Error creating task:', error);
        throw error;
    }
}

/**
 * Get all tasks for a user
 */
async function findAllByUser(userId, filters = {}) {
    try {
        let query = 'SELECT * FROM user_tasks WHERE user_id = ?';
        const params = [userId];

        // Filter by status (support multiple statuses separated by comma)
        if (filters.status) {
            const statuses = filters.status.split(',').map(s => s.trim());
            if (statuses.length === 1) {
                query += ' AND status = ?';
                params.push(statuses[0]);
            } else if (statuses.length > 1) {
                query += ' AND status IN (' + statuses.map(() => '?').join(',') + ')';
                params.push(...statuses);
            }
        }

        // Filter by priority
        if (filters.priority) {
            query += ' AND priority = ?';
            params.push(filters.priority);
        }

        // Order by
        query += ' ORDER BY created_at DESC';

        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error finding tasks:', error);
        throw error;
    }
}

/**
 * Get task by ID
 */
async function findById(taskId) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM user_tasks WHERE id = ?',
            [taskId]
        );
        return rows[0] || null;
    } catch (error) {
        console.error('Error finding task:', error);
        throw error;
    }
}

/**
 * Update a task
 */
async function update(taskId, { title, description, status, priority, due_date }) {
    try {
        const updates = [];
        const params = [];

        if (title !== undefined) {
            updates.push('title = ?');
            params.push(title);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
        }
        if (priority !== undefined) {
            updates.push('priority = ?');
            params.push(priority);
        }
        if (due_date !== undefined) {
            updates.push('due_date = ?');
            params.push(due_date);
        }

        if (updates.length === 0) {
            return null;
        }

        params.push(taskId);
        const [result] = await pool.execute(
            `UPDATE user_tasks SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
            params
        );

        if (result.affectedRows === 0) {
            return null;
        }

        return await findById(taskId);
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
}

/**
 * Delete a task
 */
async function remove(taskId) {
    try {
        const [result] = await pool.execute(
            'DELETE FROM user_tasks WHERE id = ?',
            [taskId]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
}

/**
 * Get task statistics for a user
 */
async function getStats(userId) {
    try {
        const [rows] = await pool.execute(
            `SELECT 
                status,
                COUNT(*) as count
             FROM user_tasks 
             WHERE user_id = ?
             GROUP BY status`,
            [userId]
        );

        const stats = {
            total: 0,
            pending: 0,
            in_progress: 0,
            completed: 0
        };

        rows.forEach(row => {
            stats.total += row.count;
            stats[row.status] = row.count;
        });

        return stats;
    } catch (error) {
        console.error('Error getting task stats:', error);
        throw error;
    }
}

module.exports = {
    create,
    findAllByUser,
    findById,
    update,
    remove,
    getStats
};


// backend/controllers/taskController.js
const taskModel = require('../models/taskModel');

/**
 * Create a new task
 */
async function createTask(req, res) {
    try {
        const { user_id, title, description, status, priority, due_date } = req.body;

        if (!user_id || !title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: 'user_id and title are required'
            });
        }

        const task = await taskModel.create({
            user_id,
            title: title.trim(),
            description: description ? description.trim() : null,
            status,
            priority,
            due_date
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task
        });
    } catch (error) {
        console.error('Error in createTask:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create task',
            error: error.message
        });
    }
}

/**
 * Get all tasks for a user
 */
async function getTasks(req, res) {
    try {
        const { user_id } = req.query;
        const { status, priority } = req.query;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required'
            });
        }

        const filters = {};
        if (status) filters.status = status;
        if (priority) filters.priority = priority;

        const tasks = await taskModel.findAllByUser(user_id, filters);

        res.json({
            success: true,
            data: tasks,
            count: tasks.length
        });
    } catch (error) {
        console.error('Error in getTasks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get tasks',
            error: error.message
        });
    }
}

/**
 * Get task by ID
 */
async function getTaskById(req, res) {
    try {
        const { id } = req.params;
        const task = await taskModel.findById(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        console.error('Error in getTaskById:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get task',
            error: error.message
        });
    }
}

/**
 * Update a task
 */
async function updateTask(req, res) {
    try {
        const { id } = req.params;
        const { title, description, status, priority, due_date } = req.body;

        const task = await taskModel.update(id, {
            title,
            description,
            status,
            priority,
            due_date
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            message: 'Task updated successfully',
            data: task
        });
    } catch (error) {
        console.error('Error in updateTask:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update task',
            error: error.message
        });
    }
}

/**
 * Delete a task
 */
async function deleteTask(req, res) {
    try {
        const { id } = req.params;
        const deleted = await taskModel.remove(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteTask:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete task',
            error: error.message
        });
    }
}

/**
 * Get task statistics
 */
async function getTaskStats(req, res) {
    try {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required'
            });
        }

        const stats = await taskModel.getStats(user_id);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error in getTaskStats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get task statistics',
            error: error.message
        });
    }
}

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTaskStats
};


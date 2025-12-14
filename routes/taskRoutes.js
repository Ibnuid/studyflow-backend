// backend/routes/taskRoutes.js
const express = require('express');
const taskController = require('../controllers/taskController');

const router = express.Router();

// Create a new task
router.post('/tasks', taskController.createTask);

// Get all tasks for a user
router.get('/tasks', taskController.getTasks);

// Get task statistics
router.get('/tasks/stats', taskController.getTaskStats);

// Get task by ID
router.get('/tasks/:id', taskController.getTaskById);

// Update a task
router.put('/tasks/:id', taskController.updateTask);

// Delete a task
router.delete('/tasks/:id', taskController.deleteTask);

module.exports = router;


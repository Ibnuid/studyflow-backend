// backend/routes/learningLogRoutes.js
const express = require('express');
const controller = require('../controllers/learningLogController');

const router = express.Router();

// Endpoint untuk MENCATAT progres baru
router.post('/logs', controller.createLog);

// Endpoint untuk MENGAMBIL data progres mingguan
router.get('/logs/weekly', controller.getWeeklyLogs); // ?user_id=...

module.exports = router;

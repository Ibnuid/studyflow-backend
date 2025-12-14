// backend/routes/dashboardRoutes.js
const express = require('express');
const controller = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Endpoint utama untuk dasbor Anda
router.get('/dashboard/weekly', controller.getWeeklyDashboard); // ?user_id=...

module.exports = router;

// backend/routes/notificationRoutes.js

const express = require('express');
const notificationController = require('../controllers/notificationController');
const schedulerService = require('../services/schedulerService');
const oneSignalService = require('../services/oneSignalService');

const router = express.Router();

router.get('/notifications/status/:user_id', notificationController.getNotificationStatus);

// Existing routes
router.post('/notifications/register', notificationController.registerDeviceToken);
router.put('/notifications/settings', notificationController.updateNotificationSetting);
router.post('/notifications/test', notificationController.sendTestNotification);
router.post('/notifications/trigger', async (req, res) => {
  const result = await schedulerService.triggerManualReminder();
  return res.status(200).json({
    success: true,
    message: 'Manual trigger berhasil!',
    data: result
  });
});

// Welcome notification endpoint
router.post('/notifications/welcome', async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: 'user_id required'
    });
  }

  try {
    const conn = await require('../db').getConnection();
    const [rows] = await conn.query(
      'SELECT device_token FROM notification_tokens WHERE user_id = ?',
      [user_id]
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not subscribed'
      });
    }

    const result = await oneSignalService.sendWelcome(rows[0].device_token);

    return res.status(200).json({
      success: result.success,
      message: result.success ? 'Welcome notification sent!' : 'Failed',
      data: result.data
    });

  } catch (error) {
    console.error('Welcome notification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending welcome notification'
    });
  }
});

module.exports = router;
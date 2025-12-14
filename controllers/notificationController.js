// backend/controllers/notificationController.js - FINAL VERSION

const notificationModel = require('../models/notificationModel');
const oneSignalService = require('../services/oneSignalService');

const notificationController = {
  registerDeviceToken: async (req, res) => {
    console.log('📝 Register device token request');
    console.log('   Body:', req.body);
    
    const { user_id, device_token } = req.body;

    if (!user_id || !device_token) {
      return res.status(400).json({
        success: false,
        message: 'user_id and device_token are required'
      });
    }

    try {
      const result = await notificationModel.saveDeviceToken(user_id, device_token);
      console.log('✅ Device token saved:', result);
      
      return res.status(201).json({
        success: true,
        message: 'Device token saved',
        data: result
      });
    } catch (error) {
      console.error('❌ Register token error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save device token',
        error: error.message
      });
    }
  },

  updateNotificationSetting: async (req, res) => {
    console.log('⚙️  Update notification setting');
    console.log('   Body:', req.body);
    
    const { user_id, enabled } = req.body;

    if (!user_id || typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'user_id (string) and enabled (boolean) are required',
        example: {
          user_id: "ibnu",
          enabled: true
        }
      });
    }

    try {
      await notificationModel.updateNotificationSetting(user_id, enabled);
      console.log(`✅ Notification ${enabled ? 'enabled' : 'disabled'} for:`, user_id);
      
      return res.status(200).json({
        success: true,
        message: enabled ? 'Notifikasi berhasil diaktifkan ✅' : 'Notifikasi berhasil dinonaktifkan ❌'
      });
    } catch (error) {
      console.error('❌ Update setting error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update notification setting',
        error: error.message
      });
    }
  },

  sendTestNotification: async (req, res) => {
    console.log('🧪 Test notification request');
    console.log('   Body:', req.body);
    
    const { user_id, title, message } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required',
        example: { user_id: "ibnu" }
      });
    }

    try {
      const tokenData = await notificationModel.getDeviceToken(user_id);

      if (!tokenData || !tokenData.device_token) {
        return res.status(404).json({
          success: false,
          message: 'User not subscribed to notifications'
        });
      }

      if (!tokenData.is_enabled) {
        return res.status(400).json({
          success: false,
          message: 'User has disabled notifications'
        });
      }

      console.log('📤 Sending test notification...');
      
      const result = await oneSignalService.sendNotification({
        playerIds: [tokenData.device_token],
        template: 'motivational'
      });

      return res.status(200).json({
        success: result.success,
        message: result.success ? 'Test notification sent successfully! 🎉' : 'Failed to send',
        data: result.data
      });
    } catch (error) {
      console.error('❌ Test notification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send test notification',
        error: error.message
      });
    }
  },

  getNotificationStatus: async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id parameter is required'
      });
    }

    try {
      const tokenData = await notificationModel.getDeviceToken(user_id);

      if (!tokenData) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          data: {
            user_id: user_id,
            subscribed: false,
            enabled: false,
            has_token: false
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          user_id: user_id,
          subscribed: !!tokenData.device_token,
          enabled: tokenData.is_enabled === 1,
          has_token: !!tokenData.device_token
        }
      });
    } catch (error) {
      console.error('❌ Get status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get notification status',
        error: error.message
      });
    }
  }
};

module.exports = notificationController;

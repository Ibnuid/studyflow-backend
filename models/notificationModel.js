// backend/models/notificationModel.js - FINAL VERSION

const pool = require('../db');

const NotificationModel = {
  /**
   * Save or Update Device Token
   */
  saveDeviceToken: async (user_id, deviceToken) => {
    const conn = await pool.getConnection();
    try {
      const [existing] = await conn.query(
        'SELECT * FROM notification_tokens WHERE user_id = ?',
        [user_id]
      );

      if (existing.length > 0) {
        await conn.query(
          'UPDATE notification_tokens SET device_token = ?, updated_at = NOW() WHERE user_id = ?',
          [deviceToken, user_id]
        );
        return { user_id, device_token: deviceToken };
      } else {
        const [result] = await conn.query(
          'INSERT INTO notification_tokens (user_id, device_token, is_enabled) VALUES (?, ?, TRUE)',
          [user_id, deviceToken]
        );
        return { id: result.insertId, user_id, device_token: deviceToken };
      }
    } finally {
      conn.release();
    }
  },

  /**
   * Get Users that Need Reminder
   */
  getUsersNeedReminder: async (dayName) => {
    const conn = await pool.getConnection();
    try {
      const today = new Date().toLocaleDateString('sv-SE');

      const [rows] = await conn.query(`
        SELECT DISTINCT 
          nt.user_id,
          nt.device_token,
          wt.days
        FROM notification_tokens nt
        INNER JOIN weekly_targets wt ON nt.user_id = wt.user_id
        LEFT JOIN learning_logs ll ON nt.user_id = ll.user_id 
          AND DATE(ll.log_date) = ?
        WHERE nt.is_enabled = TRUE
          AND nt.device_token IS NOT NULL
          AND JSON_CONTAINS(wt.days, ?)
          AND ll.id IS NULL
      `, [today, JSON.stringify(dayName)]);

      return rows;
    } finally {
      conn.release();
    }
  },

  /**
   * Update Notification Setting
   */
  updateNotificationSetting: async (user_id, enabled) => {
    const conn = await pool.getConnection();
    try {
      await conn.query(
        'UPDATE notification_tokens SET is_enabled = ?, updated_at = NOW() WHERE user_id = ?',
        [enabled, user_id]
      );
      return true;
    } finally {
      conn.release();
    }
  },

  /**
   * ✅ TAMBAH METHOD INI - Get Device Token by User ID
   */
  getDeviceToken: async (user_id) => {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        'SELECT device_token, is_enabled FROM notification_tokens WHERE user_id = ?',
        [user_id]
      );
      
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }
};

module.exports = NotificationModel;

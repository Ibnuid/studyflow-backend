// backend/controllers/learningLogController.js
const model = require('../models/learningLogModel');

/**
 * Handler untuk membuat log belajar baru
 */
const createLog = async (req, res) => {
  const { user_id, log_date, notes, related_task_ids } = req.body;

  if (!user_id || !log_date) {
    return res.status(400).json({ success: false, message: 'user_id and log_date required' });
  }

  try {
    const created = await model.create({ user_id, log_date, notes, related_task_ids });
    
    // Update tasks status to completed if they are in related_task_ids
    if (related_task_ids && Array.isArray(related_task_ids) && related_task_ids.length > 0) {
      const taskModel = require('../models/taskModel');
      for (const taskId of related_task_ids) {
        try {
          await taskModel.update(taskId, { status: 'completed' });
        } catch (err) {
          console.warn(`Failed to update task ${taskId}:`, err);
        }
      }
    }
    
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to create log' });
  }
};

/**
 * Handler untuk mengambil log belajar mingguan
 */
const getWeeklyLogs = async (req, res) => {
  const { user_id } = req.session.userId;

  if (!user_id) {
    return res.status(400).json({ success: false, message: 'user_id required' });
  }

  try {
    // Tentukan rentang tanggal (7 hari terakhir)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6); // 7 hari total (termasuk hari ini)

    // Format ke YYYY-MM-DD
    const endDateStr = endDate.toISOString().split('T')[0];
    const startDateStr = startDate.toISOString().split('T')[0];

    const items = await model.findByUserAndDateRange(user_id, startDateStr, endDateStr);
    return res.status(200).json({
      success: true,
      range: { start: startDateStr, end: endDateStr },
      data: items
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to get logs' });
  }
};

module.exports = {
  createLog,
  getWeeklyLogs,
};

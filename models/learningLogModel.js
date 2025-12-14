// backend/models/learningLogModel.js
const pool = require('../db');

/**
 * Mencatat log belajar baru
 */
const create = async ({ user_id, log_date, notes, related_task_ids }) => {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      'INSERT INTO learning_logs (user_id, log_date, notes, related_task_ids) VALUES (?, ?, ?, ?)',
      [user_id, log_date, notes || null, related_task_ids ? JSON.stringify(related_task_ids) : null]
    );
    return { id: result.insertId, user_id, log_date, notes, related_task_ids };
  } finally {
    conn.release();
  }
};

/**
 * Mengambil log belajar berdasarkan user_id dan rentang tanggal (mis. 7 hari terakhir)
 */
const findByUserAndDateRange = async (user_id, startDate, endDate) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      'SELECT * FROM learning_logs WHERE user_id = ? AND log_date BETWEEN ? AND ? ORDER BY log_date DESC',
      [user_id, startDate, endDate]
    );
    return rows;
  } finally {
    conn.release();
  }
};

module.exports = {
  create,
  findByUserAndDateRange,
};
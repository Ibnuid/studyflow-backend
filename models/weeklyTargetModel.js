// models/weeklyTargetModel.js
const pool = require('../db');

const create = async ({ user_id, days, note }) => {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      'INSERT INTO weekly_targets (user_id, days, note) VALUES (?, ?, ?)',
      [user_id, JSON.stringify(days), note || null]
    );
    return { id: result.insertId, user_id, days, note };
  } finally {
    conn.release();
  }
};

const findAllByUser = async (user_id) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM weekly_targets WHERE user_id = ?', [user_id]);
    return rows;
  } finally {
    conn.release();
  }
};

const findById = async (id) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM weekly_targets WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const r = rows[0];
    return r;
  } finally {
    conn.release();
  }
};

const update = async (id, { days, note }) => {
  const conn = await pool.getConnection();
  try {
    await conn.query('UPDATE weekly_targets SET days = ?, note = ? WHERE id = ?', [JSON.stringify(days), note || null, id]);
    return findById(id);
  } finally {
    conn.release();
  }
};

const remove = async (id) => {
  const conn = await pool.getConnection();
  try {
    const [res] = await conn.query('DELETE FROM weekly_targets WHERE id = ?', [id]);
    return res.affectedRows > 0;
  } finally {
    conn.release();
  }
};

module.exports = {
  create,
  findAllByUser,
  findById,
  update,
  remove
};

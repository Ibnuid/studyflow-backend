// controllers/weeklyTargetController.js
const model = require('../models/weeklyTargetModel');

const createTarget = async (req, res) => {
  const { user_id, days, note } = req.body;

  // Simple validation
  if (!user_id || !days || !Array.isArray(days) || days.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid input' });
  }

  try {
    const created = await model.create({ user_id, days, note });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to create target' });
  }
};

const getTargets = async (req, res) => {
  // Support both query parameter and session
  const user_id = req.query.user_id || req.session.userId;

  if (!user_id) {
    return res.status(400).json({ success: false, message: 'user_id required' });
  }

  try {
    const items = await model.findAllByUser(user_id);
    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to get targets' });
  }
};

const getTargetById = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await model.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to get target' });
  }
};

const updateTarget = async (req, res) => {
  const { id } = req.params;
  const { days, note } = req.body;

  if (!days || !Array.isArray(days) || days.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid input' });
  }

  try {
    const updated = await model.update(id, { days, note });
    if (!updated) return res.status(400).json({ success: false, message: 'Update failed' });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to update target' });
  }
};

const deleteTarget = async (req, res) => {
  const { id } = req.params;

  try {
    const ok = await model.remove(id);
    if (!ok) return res.status(404).json({ success: false, message: 'Not found' });
    return res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to delete target' });
  }
};

module.exports = {
  createTarget,
  getTargets,
  getTargetById,
  updateTarget,
  deleteTarget
};

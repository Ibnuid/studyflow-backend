// backend/controllers/dashboardController.js
// Import KEDUA model
const targetModel = require('../models/weeklyTargetModel');
const logModel = require('../models/learningLogModel');
let currentStreak = 0;

/**
 * Handler untuk mengambil data gabungan dasbor mingguan
 */
const getWeeklyDashboard = async (req, res) => {
  const user_id = req.session.userId;

  if (!user_id) {
    return res.status(401).json({ success: false, message: 'Session expired' });
  }

  try {
    // --- Langkah 1: Tentukan Rentang Tanggal ---
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6); // 7 hari total (termasuk hari ini)
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // --- Langkah 2: Ambil Data Target (dari Poin 1) ---
    const targets = await targetModel.findAllByUser(user_id);
    let targetCount = 0;
    if (targets.length > 0) {
      // Asumsi kita hanya peduli pada target pertama yang diset
      targetCount = targets[0].days.length;
    }

    // --- Langkah 3: Ambil Data Progres Aktual (dari Poin 2) ---
    const logs = await logModel.findByUserAndDateRange(user_id, startDateStr, endDateStr);
    // Kita hitung jumlah log unik per hari, jika perlu
    // Untuk MVP, kita hitung jumlah log saja
    const actualCount = logs.length;
    const sortedLogs = logs.sort((a, b) => new Date(b.log_date) - new Date(a.log_date));

    // --- Langkah 4: Kirim Respons Gabungan ---
    const responseData = {
      target: targetCount,
      actual: actualCount,
      range: { start: startDateStr, end: endDateStr },
      targetDetails: targets.length > 0 ? targets[0] : null,
      actualDetails: logs,
      streak: currentStreak
    };

    return res.status(200).json({ success: true, data: responseData });

  } catch (err) {
    console.error('Error in dashboard controller:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  getWeeklyDashboard,
};

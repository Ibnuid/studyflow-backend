// backend/services/schedulerService.js

const cron = require('node-cron');
const moment = require('moment-timezone');
const notificationModel = require('../models/notificationModel');
const oneSignalService = require('./oneSignalService');

require('dotenv').config();

const TIMEZONE = process.env.TIMEZONE || 'Asia/Jakarta';
const REMINDER_TIME = process.env.REMINDER_TIME || '09:00';

const sendDailyReminders = async () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  ⏰ DAILY REMINDER SCHEDULER           ║');
  console.log('║  Waktu:', moment().tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss'), '    ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const today = new Date().getDay();
    const todayName = dayNames[today];

    console.log('📅 Hari ini:', todayName);
    console.log('📅 Hari index:', today)

    const users = await notificationModel.getUsersNeedReminder(todayName);
    
    console.log('📋 User yang perlu reminder (' + todayName + '):', users.length);

    if (users.length === 0) {
      console.log('✅ Tidak ada user yang perlu reminder hari ini.\n');
      return { success: true, sent: 0, failed: 0 };
    }

    console.log('📨 Ditemukan', users.length, 'user yang perlu diingatkan:\n');

    let successCount = 0;
    let failedCount = 0;

    for (const user of users) {
      console.log('   → User:', user.user_id);

      // ✅ Send dengan template yang menarik
      const result = await oneSignalService.sendDailyReminder(user.device_token, todayName);

      if (result.success) {
        console.log('     ✅ Notifikasi terkirim');
        successCount++;
      } else {
        console.log('     ❌ Gagal:', result.error);
        failedCount++;
      }
    }

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  📊 SUMMARY                            ║');
    console.log('║  Berhasil:', successCount, '                          ║');
    console.log('║  Gagal:', failedCount, '                              ║');
    console.log('╚════════════════════════════════════════╝\n');

    return { success: true, sent: successCount, failed: failedCount };

  } catch (error) {
    console.error('❌ Error di scheduler:', error);
    return { success: false, error: error.message };
  }
};

const triggerManualReminder = async () => {
  console.log('🔧 Manual trigger dipanggil...\n');
  return await sendDailyReminders();
};

const initScheduler = () => {
  const [hour, minute] = REMINDER_TIME.split(':');
  const cronExpression = `${minute} ${hour} * * *`;

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  🚀 NOTIFICATION SCHEDULER STARTED     ║');
  console.log('╠════════════════════════════════════════╣');
  console.log('║  Jadwal: Setiap hari jam', REMINDER_TIME, '       ║');
  console.log('║  Timezone:', TIMEZONE, '             ║');
  console.log('║  Cron:', cronExpression, '                 ║');
  console.log('╚════════════════════════════════════════╝\n');

  cron.schedule(cronExpression, sendDailyReminders, {
    timezone: TIMEZONE
  });

  console.log('✅ Scheduler aktif dan menunggu waktu eksekusi...\n');
};

module.exports = {
  initScheduler,
  sendDailyReminders,
  triggerManualReminder
};

// backend/services/oneSignalService.js

const axios = require('axios');
require('dotenv').config();

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;
const ONESIGNAL_API_URL = 'https://onesignal.com/api/v1/notifications';

const OneSignalService = {
  templates: {
    dailyReminder: {
      headings: { "en": "⏰ Waktunya Belajar!" },
      contents: { "en": "Hai! Hari ini ({day}) adalah jadwal belajarmu. Yuk catat progres belajarmu sekarang! 📚✨" },
      buttons: [
        { "id": "open-app", "text": "Buka Aplikasi 🚀" },
        { "id": "later", "text": "Nanti" }
      ]
    },
    
    welcomeMessage: {
      headings: { "en": "🎉 Selamat Datang di StudyFlow!" },
      contents: { "en": "Terima kasih sudah mengaktifkan notifikasi! Kamu akan mendapat pengingat belajar setiap hari jam 09:00 WIB 📖" },
      buttons: [
        { "id": "dashboard", "text": "Lihat Dashboard 📊" }
      ]
    },
    
    motivational: {
      headings: { "en": "💪 Semangat Belajar!" },
      contents: { "en": "Konsistensi adalah kunci sukses! Jangan lupa catat progress belajarmu hari ini ya 🌟" }
    }
  },

  sendNotification: async ({ playerIds, template = 'dailyReminder', data = {} }) => {
    try {
      const notifTemplate = OneSignalService.templates[template] || OneSignalService.templates.dailyReminder;
      
      let headings = notifTemplate.headings["en"];
      let contents = notifTemplate.contents["en"];
      
      Object.keys(data).forEach(key => {
        headings = headings.replace(`{${key}}`, data[key]);
        contents = contents.replace(`{${key}}`, data[key]);
      });

      console.log('📤 Mengirim notifikasi...');
      console.log('   Template:', template);
      console.log('   Judul:', headings);
      console.log('   Pesan:', contents);
      console.log('   Penerima:', playerIds.length, 'user');

      // ✅ FIX: Hanya pakai web_url (hapus url)
      const payload = {
        app_id: ONESIGNAL_APP_ID,
        include_player_ids: playerIds,
        headings: { "en": headings },
        contents: { "en": contents },
        buttons: notifTemplate.buttons || [],
        
        // ✅ HANYA web_url (bukan url + web_url)
        web_url: 'http://localhost:5001/dashboard',
        
        // Appearance
        large_icon: "https://via.placeholder.com/192x192?text=📚",
        
        // Priority & TTL
        priority: 10,
        ttl: 86400
      };

      const response = await axios.post(ONESIGNAL_API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
        }
      });

      console.log('✅ Notifikasi berhasil dikirim!');
      console.log('   ID:', response.data.id);
      console.log('   Recipients:', response.data.recipients);

      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Gagal kirim notifikasi:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  },

  sendWelcome: async (playerId) => {
    return await OneSignalService.sendNotification({
      playerIds: [playerId],
      template: 'welcomeMessage'
    });
  },

  sendDailyReminder: async (playerId, dayName) => {
    return await OneSignalService.sendNotification({
      playerIds: [playerId],
      template: 'dailyReminder',
      data: { day: dayName }
    });
  },

  sendMotivational: async (playerId) => {
    return await OneSignalService.sendNotification({
      playerIds: [playerId],
      template: 'motivational'
    });
  }
};


module.exports = OneSignalService;

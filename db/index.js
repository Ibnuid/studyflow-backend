// backend/db/index.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'learningweeklytarget',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '') {
  config.password = process.env.DB_PASSWORD;
}

console.log('📊 Database Config:');
console.log('   Host:', config.host);
console.log('   User:', config.user);
console.log('   Database:', config.database);
console.log('   Port:', config.port);

const pool = mysql.createPool(config);

// ⚠️ JANGAN MATIKAN SERVER
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL Connected Successfully!');
    conn.release();
  } catch (err) {
    console.error('⚠️ MySQL NOT connected (server tetap jalan)');
    console.error('   Code:', err.code);
    console.error('   Message:', err.message);
    console.error('   ➜ Pastikan DB bisa diakses dari Render');
  }
})();

module.exports = pool;

// backend/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 5001;

/**
 * =========================
 *  Basic middleware
 * =========================
 */
app.use(compression());

// (Opsional) CSP - untuk API sebenarnya tidak wajib.
// Kalau kamu nggak butuh, boleh hapus biar simpel.
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
  );
  next();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * =========================
 *  CORS (ketat & aman)
 * =========================
 * - Render akan diakses dari studyflow.my.id
 * - origin false/undefined (Postman/curl) tetap boleh
 */
const allowedOrigins = [
  'https://studyflow.my.id',
  'http://studyflow.my.id',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman/curl
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`), false);
    },
    credentials: true,
  })
);

/**
 * =========================
 *  Health check (paling awal)
 * =========================
 * Biar gampang cek Render "hidup" walau DB error.
 */
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'studyflow-api',
    time: new Date().toISOString(),
  });
});


app.set('trust proxy', 1);
/**
 * =========================
 *  Session (aman untuk Render)
 * =========================
 * Default: MATIIN session DB dulu.
 *
 * Render sering gagal kalau:
 * - MySQL remote tidak bisa diakses
 * - whitelist IP tidak cocok
 *
 * Nyalakan kalau DB sudah jelas bisa:
 * USE_DB_SESSION=true
 */
const USE_DB_SESSION = process.env.USE_DB_SESSION === 'true';

const sessionConfig = {
  key: process.env.SESSION_KEY || 'studyflow.sid',
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
  secure: true,  // WAJIB untuk cross-origin
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: 'none',  // WAJIB untuk cross-origin
},
};

if (USE_DB_SESSION) {
  // Hanya require MySQLStore kalau memang dipakai
  const MySQLStore = require('express-mysql-session')(session);
  const pool = require('./db/index');

  // Biar nggak crash diam-diam kalau DB bermasalah
  try {
    const sessionStore = new MySQLStore({}, pool);
    sessionConfig.store = sessionStore;
    console.log('✅ Using MySQL session store');
  } catch (err) {
    console.error('❌ Failed to init MySQL session store:', err.message);
    console.error('   Hint: set USE_DB_SESSION=false temporarily');
  }
} else {
  console.log('ℹ️  Using MemoryStore session (USE_DB_SESSION=false)');
}

app.use(session(sessionConfig));

/**
 * =========================
 *  API Routes
 * =========================
 */
app.use('/api', require('./routes/weeklyTargetRoutes'));
app.use('/api', require('./routes/learningLogRoutes'));
app.use('/api', require('./routes/dashboardRoutes'));
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/notificationRoutes'));
app.use('/api', require('./routes/pomodoroRoutes'));
app.use('/api', require('./routes/taskRoutes'));

/**
 * =========================
 *  Scheduler (kontrol biar aman)
 * =========================
 * Render bisa restart otomatis, scheduler bisa dobel jalan.
 * Jadi nyalakan hanya kalau kamu mau.
 *
 * Set ENABLE_SCHEDULER=true untuk aktif.
 */
if (process.env.ENABLE_SCHEDULER === 'true') {
  try {
    require('./services/schedulerService').initScheduler();
    console.log('✅ Scheduler enabled');
  } catch (err) {
    console.error('❌ Scheduler init error:', err.message);
  }
} else {
  console.log('ℹ️  Scheduler disabled (ENABLE_SCHEDULER!=true)');
}

/**
 * =========================
 *  Error handler (biar jelas kalau CORS/route error)
 * =========================
 */
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ ok: false, error: err.message });
});

/**
 * =========================
 *  Start Server (Render)
 * =========================
 */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 StudyFlow API running on port ${PORT}`);
});

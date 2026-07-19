require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { verifyToken } = require('./middleware/authMiddleware');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const config = require('./config');

const app = express();
const PORT = config.port;

// ─── Security ────────────────────────────────────────────────────────
app.use(helmet());
app.use(compression());

// ─── Request logging ─────────────────────────────────────────────────
app.use(morgan('dev'));

// ─── CORS ────────────────────────────────────────────────────────────
const isLocalhostOrigin = (origin) => {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (config.cors.allowedOrigins.includes(origin) || isLocalhostOrigin(origin)) {
        return callback(null, true);
      }
      console.error(`Blocked CORS origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// ─── Body parsing ────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate limiting ───────────────────────────────────────────────────
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Health check ────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Campus Bridge API is up and running 🚀', version: '2.0.0' });
});

// ─── Routes ──────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', verifyToken, require('./routes/student'));
app.use('/api/faculty', verifyToken, require('./routes/faculty'));
app.use('/api/admin', verifyToken, require('./routes/admin'));
app.use('/api/announcements', verifyToken, require('./routes/announcements'));
app.use('/api/channels', verifyToken, require('./routes/channels'));
app.use("/api/attendance", require("./routes/attendance"));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/lost-found', verifyToken, require('./routes/lostfound'));
app.use('/api/placements', require('./routes/placements'));
app.use('/api/academic', require('./routes/academic'));
app.use('/api/profiles', require('./routes/profiles'));

// ─── 404 handler ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Global error handler ────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

// d:/Project/campus-bridge/campus-bridge/backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { verifyToken } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- CORS ----------
const allowedOrigins = [
  'http://localhost:5173',           // Vite dev server (default port)
  'http://localhost:5174',           // Vite dev server (alternate port)
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://yourapp.vercel.app'       // production – replace with your actual domain
];
const isLocalhostOrigin = (origin) => {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
};
app.use(
  cors({
    origin: (origin, callback) => {
      // allow tools like Postman (no origin) or the listed origins
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || isLocalhostOrigin(origin)) return callback(null, true);
      console.error(`Blocked CORS origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

app.use(express.json());

// -------------------------------------------------
//  ✅  HEALTH‑CHECK / ROOT ENDPOINT
// -------------------------------------------------
app.get('/', (req, res) => {
  res.json({ message: 'College Portal API is up and running 🚀' });
});

// ---------- ROUTES ----------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', verifyToken, require('./routes/student'));
app.use('/api/faculty', verifyToken, require('./routes/faculty'));
app.use('/api/admin', verifyToken, require('./routes/admin'));
app.use('/api/announcements', verifyToken, require('./routes/announcements'));
app.use('/api/channels', verifyToken, require('./routes/channels'));
app.use('/api/lost-found', verifyToken, require('./routes/lostfound'));

// ---------- GLOBAL ERROR HANDLER ----------
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
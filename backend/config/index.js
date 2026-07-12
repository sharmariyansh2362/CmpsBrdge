// Backend configuration
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: '7d',
  bcryptRounds: 12,
  rateLimits: {
    general: { windowMs: 15 * 60 * 1000, max: 100 },
    auth: { windowMs: 15 * 60 * 1000, max: 20 },
  },
  cors: {
    allowedOrigins: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'https://cmps-brdge.vercel.app',
    ],
  },
};

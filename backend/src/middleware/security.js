const helmet = require('helmet');
const cors = require('cors');
const express = require('express');

function parseAllowedOrigins() {
  const raw = process.env.CORS_ALLOWED_ORIGINS || '';
  const list = raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  return new Set(list);
}

function configureSecurity(app) {
  const allowed = parseAllowedOrigins();
  if (allowed.size === 0) {
    console.warn('[security] CORS_ALLOWED_ORIGINS not set; allowing dynamic origin during development');
  }

  app.use(cors({
    credentials: true,
    origin: (origin, callback) => {
      // Allow non-browser or same-origin requests (no origin)
      if (!origin) return callback(null, true);
      if (allowed.size === 0) return callback(null, true);
      if (allowed.has(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
  }));

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(express.json({ limit: '1mb' }));
}

module.exports = configureSecurity;

const helmet = require('helmet');
const cors = require('cors');
const express = require('express');

function configureSecurity(app) {
  app.use(cors({ origin: true, credentials: true }));
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(express.json({ limit: '1mb' }));
}

module.exports = configureSecurity;

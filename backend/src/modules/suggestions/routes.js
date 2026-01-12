const express = require('express');
const router = express.Router();
const { createSuggestion } = require('./controller');
const { requireAuthOptional } = require('../auth/middleware');
const rateLimiter = require('../../middleware/rateLimiter').suggestionLimiter;

// POST /api/suggestions
router.post('/', rateLimiter, requireAuthOptional, createSuggestion);

module.exports = router;

const express = require('express');
const router = express.Router();
const { registerLimiter, loginLimiter } = require('../../middleware/rateLimiter');
const { requireAuth } = require('./middleware');
const controller = require('./controller');

// Keep existing paths: /api/register and /api/login
router.post('/register', registerLimiter, controller.register);
router.post('/login', loginLimiter, controller.login);

// Token lifecycle endpoints
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', requireAuth, controller.me);

module.exports = router;

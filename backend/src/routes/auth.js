const express = require('express');
const router = express.Router();
const { registerLimiter, loginLimiter } = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');

router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);

module.exports = router;

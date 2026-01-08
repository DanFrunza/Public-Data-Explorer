const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireAuth } = require('../auth/middleware');
const controller = require('./controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Current user's endpoints MUST come before parameterized routes
router.post('/me/avatar', requireAuth, upload.single('avatar'), controller.uploadAvatarMe);
router.get('/me/avatar-url', requireAuth, controller.getMyAvatarUrl);
router.get('/me', requireAuth, controller.getMe);
router.put('/me', requireAuth, controller.updateMe);

// Parameterized routes
router.post('/:id/avatar', requireAuth, upload.single('avatar'), controller.uploadAvatar);
router.get('/:id/avatar-url', requireAuth, controller.getAvatarUrl);
// Update current user's profile
router.put('/me', requireAuth, controller.updateMe);



module.exports = router;

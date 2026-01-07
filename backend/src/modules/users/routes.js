const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireAuth } = require('../auth/middleware');
const controller = require('./controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Upload avatar for current user; id must match token subject or admin role
router.post('/:id/avatar', requireAuth, upload.single('avatar'), controller.uploadAvatar);

// Get presigned URL for avatar
router.get('/:id/avatar-url', requireAuth, controller.getAvatarUrl);

module.exports = router;

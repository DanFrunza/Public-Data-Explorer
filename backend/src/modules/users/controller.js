const crypto = require('crypto');
const { putObject, presignedGetObject } = require('../../media/minio');
const pool = require('../../db/pool');

function inferExt(mime, originalName) {
  const map = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  if (map[mime]) return map[mime];
  const m = String(originalName).toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);
  return m ? (m[1] === 'jpeg' ? 'jpg' : m[1]) : 'jpg';
}

function buildAvatarKey(userId, mimeType, originalName) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const rand = crypto.randomBytes(6).toString('hex');
  const ext = inferExt(mimeType, originalName);
  return `avatars/users/${userId}/${stamp}_${rand}.${ext}`;
}

async function uploadAvatar(req, res) {
  try {
    const userId = String(req.params.id);
    const authSub = String(req.auth?.sub || '');
    const role = req.auth?.role || 'user';
    if (authSub !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file provided' });

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) return res.status(400).json({ message: 'Unsupported file type' });

    const key = buildAvatarKey(userId, file.mimetype, file.originalname);
    await putObject(key, file.buffer, file.mimetype);

    const etagRes = await pool.query('UPDATE users SET avatar_key = $1, avatar_updated_at = NOW() WHERE id = $2 RETURNING avatar_key', [key, userId]);
    const savedKey = etagRes.rows[0]?.avatar_key;
    const url = await presignedGetObject(savedKey, 900);

    return res.status(201).json({ avatarKey: savedKey, avatarUrl: url });
  } catch (err) {
    console.error('uploadAvatar error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getAvatarUrl(req, res) {
  try {
    const userId = String(req.params.id);
    const authSub = String(req.auth?.sub || '');
    const role = req.auth?.role || 'user';
    if (authSub !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const q = await pool.query('SELECT avatar_key FROM users WHERE id = $1', [userId]);
    const key = q.rows[0]?.avatar_key;
    if (!key) return res.status(404).json({ message: 'No avatar' });

    const url = await presignedGetObject(key, 900);
    return res.json({ avatarUrl: url });
  } catch (err) {
    console.error('getAvatarUrl error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { uploadAvatar, getAvatarUrl };

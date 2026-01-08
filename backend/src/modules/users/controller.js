const crypto = require('crypto');
const { putObject, presignedGetObject } = require('../../media/minio');
const { findUserById } = require('../auth/service');
const pool = require('../../db/pool');
const Buffer = require('buffer').Buffer;

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

function hasJpegSig(buf) {
  return buf && buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
}
function hasPngSig(buf) {
  const sig = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  if (!buf || buf.length < sig.length) return false;
  for (let i = 0; i < sig.length; i++) if (buf[i] !== sig[i]) return false;
  return true;
}
function hasWebpSig(buf) {
  if (!buf || buf.length < 12) return false;
  const riff = buf.slice(0, 4).toString('ascii') === 'RIFF';
  const webp = buf.slice(8, 12).toString('ascii') === 'WEBP';
  return riff && webp;
}

function verifyImageSignature(mime, buffer) {
  try {
    if (mime === 'image/jpeg') return hasJpegSig(buffer);
    if (mime === 'image/png') return hasPngSig(buffer);
    if (mime === 'image/webp') return hasWebpSig(buffer);
    return false;
  } catch {
    return false;
  }
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
    if (!verifyImageSignature(file.mimetype, file.buffer)) return res.status(400).json({ message: 'Invalid image content' });

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
 
async function getMe(req, res) {
  try {
    const userId = req.auth?.sub;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const {
      email,
      first_name,
      last_name,
      country,
      created_at,
      gender,
      date_of_birth,
      city,
      occupation,
      bio,
      phone,
      timezone,
      locale,
      plan,
      role,
      avatar_key,
    } = user;

    let avatar_url = null;
    if (avatar_key) {
      try { avatar_url = await presignedGetObject(avatar_key, 900); } catch {}
    }

    const safeUser = {
      email,
      first_name,
      last_name,
      country,
      created_at,
      gender,
      date_of_birth,
      city,
      occupation,
      bio,
      phone,
      timezone,
      locale,
      plan,
      role,
      avatar_url,
    };

    return res.json({ user: safeUser });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports.getMe = getMe;

// Upload avatar for current user without requiring path id
async function uploadAvatarMe(req, res) {
  try {
    const authSub = String(req.auth?.sub || '');
    if (!authSub) return res.status(401).json({ message: 'Unauthorized' });
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file provided' });
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) return res.status(400).json({ message: 'Unsupported file type' });
    if (!verifyImageSignature(file.mimetype, file.buffer)) return res.status(400).json({ message: 'Invalid image content' });
    const key = buildAvatarKey(authSub, file.mimetype, file.originalname);
    await putObject(key, file.buffer, file.mimetype);
    const etagRes = await pool.query('UPDATE users SET avatar_key = $1, avatar_updated_at = NOW() WHERE id = $2 RETURNING avatar_key', [key, authSub]);
    const savedKey = etagRes.rows[0]?.avatar_key;
    const url = await presignedGetObject(savedKey, 900);
    return res.status(201).json({ avatarKey: savedKey, avatarUrl: url });
  } catch (err) {
    console.error('uploadAvatarMe error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Get current user's avatar URL without path id
async function getMyAvatarUrl(req, res) {
  try {
    const authSub = String(req.auth?.sub || '');
    if (!authSub) return res.status(401).json({ message: 'Unauthorized' });
    const q = await pool.query('SELECT avatar_key FROM users WHERE id = $1', [authSub]);
    const key = q.rows[0]?.avatar_key;
    if (!key) return res.status(404).json({ message: 'No avatar' });
    const url = await presignedGetObject(key, 900);
    return res.json({ avatarUrl: url });
  } catch (err) {
    console.error('getMyAvatarUrl error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports.uploadAvatarMe = uploadAvatarMe;
module.exports.getMyAvatarUrl = getMyAvatarUrl;

// Update current user's editable profile fields
async function updateMe(req, res) {
  try {
    const userId = req.auth?.sub;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const allowed = [
      'first_name', 'last_name', 'country', 'city', 'occupation', 'bio',
      'phone', 'timezone', 'locale', 'gender', 'date_of_birth'
    ];
    const updates = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
        updates[key] = req.body[key];
      }
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided' });
    }

    // Basic normalization
    if (typeof updates.first_name === 'string') updates.first_name = updates.first_name.trim();
    if (typeof updates.last_name === 'string') updates.last_name = updates.last_name.trim();
    if (typeof updates.country === 'string') updates.country = updates.country.trim();
    if (typeof updates.city === 'string') updates.city = updates.city.trim();
    if (typeof updates.occupation === 'string') updates.occupation = updates.occupation.trim();
    if (typeof updates.bio === 'string') updates.bio = updates.bio.trim();
    if (typeof updates.phone === 'string') updates.phone = updates.phone.trim();
    if (typeof updates.timezone === 'string') updates.timezone = updates.timezone.trim();
    if (typeof updates.locale === 'string') updates.locale = updates.locale.trim();
    if (typeof updates.gender === 'string') updates.gender = updates.gender.trim();
    if (typeof updates.date_of_birth === 'string' && updates.date_of_birth) {
      const d = new Date(updates.date_of_birth);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ message: 'Invalid date_of_birth' });
      }
      updates.date_of_birth = d.toISOString();
    }

    // Build dynamic update query
    const setParts = [];
    const values = [];
    let idx = 1;
    for (const [k, v] of Object.entries(updates)) {
      setParts.push(`${k} = $${idx++}`);
      values.push(v);
    }
    values.push(userId);
    const sql = `UPDATE users SET ${setParts.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;
    const { rows } = await pool.query(sql, values);
    const user = rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });

    let avatar_url = null;
    if (user.avatar_key) {
      try { avatar_url = await presignedGetObject(user.avatar_key, 900); } catch {}
    }
    const safeUser = {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      country: user.country,
      created_at: user.created_at,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      city: user.city,
      occupation: user.occupation,
      bio: user.bio,
      phone: user.phone,
      timezone: user.timezone,
      locale: user.locale,
      plan: user.plan,
      role: user.role,
      avatar_url,
    };
    return res.json({ user: safeUser });
  } catch (err) {
    console.error('updateMe error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports.updateMe = updateMe;

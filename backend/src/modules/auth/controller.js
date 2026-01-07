const argon2 = require('argon2');
const { validateRegister, validateLogin } = require('./validation');
const { createUser, findUserByEmail, findUserById, verifyPassword, getRefreshTokenByJti, markRotated, revokeByJti } = require('./service');
const { signAccess, issueRefresh, parseRefreshCookie, buildRefreshCookieOptions } = require('./tokens');
const { presignedGetObject } = require('../../media/minio');

async function register(req, res) {
  try {
    const errors = validateRegister(req.body || {});
    if (Object.keys(errors).length) return res.status(400).json({ errors });

    const { email, password, first_name, last_name, country } = req.body;
    const user = await createUser({ email, password, first_name, last_name, country });

    // Issue tokens upon successful registration
    const accessToken = signAccess(user);
    const refresh = await issueRefresh(user, req);
    res.cookie('refresh_token', refresh.value, refresh.cookieOptions);

    let avatar_url = null;
    if (user.avatar_key) {
      try { avatar_url = await presignedGetObject(user.avatar_key, 900); } catch {}
    }
    return res.status(201).json({ message: 'Account created', user: { ...user, avatar_url }, accessToken });
  } catch (err) {
    if (err && err.code === '23505') {
      return res.status(409).json({ message: 'Email already registered' });
    }
    console.error('register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function login(req, res) {
  try {
    const errors = validateLogin(req.body || {});
    if (Object.keys(errors).length) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await verifyPassword(user.password_hash, password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = signAccess(user);
    const refresh = await issueRefresh(user, req);
    res.cookie('refresh_token', refresh.value, refresh.cookieOptions);

    const { id, email: uemail, first_name, last_name, country, created_at, avatar_key, plan, role } = user;
    let avatar_url = null;
    if (avatar_key) {
      try { avatar_url = await presignedGetObject(avatar_key, 900); } catch {}
    }
    return res.json({ message: 'Login successful', user: { id, email: uemail, first_name, last_name, country, plan, role, created_at, avatar_key, avatar_url }, accessToken });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function refresh(req, res) {
  try {
    const cookieVal = (req.cookies && req.cookies.refresh_token) || null;
    const parsed = parseRefreshCookie(cookieVal);
    if (!parsed) return res.status(401).json({ message: 'Missing refresh token' });

    const record = await getRefreshTokenByJti(parsed.jti);
    if (!record) return res.status(401).json({ message: 'Invalid refresh token' });
    if (record.revoked_at) return res.status(401).json({ message: 'Refresh token revoked' });
    if (record.rotated_at) return res.status(401).json({ message: 'Refresh token rotated' });
    if (new Date(record.expires_at).getTime() < Date.now()) return res.status(401).json({ message: 'Refresh token expired' });

    const ok = await argon2.verify(record.token_hash, parsed.raw);
    if (!ok) {
      // Possible reuse detection - revoke this token
      await revokeByJti(parsed.jti);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Rotate old token and issue a new one
    await markRotated(parsed.jti);
    const user = await findUserById(record.user_id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const accessToken = signAccess(user);
    const next = await issueRefresh(user, req);
    res.cookie('refresh_token', next.value, next.cookieOptions);

    const { id, email: uemail, first_name, last_name, country, created_at, avatar_key, plan, role } = user;
    let avatar_url = null;
    if (avatar_key) {
      try { avatar_url = await presignedGetObject(avatar_key, 900); } catch {}
    }
    return res.json({ accessToken, user: { id, email: uemail, first_name, last_name, country, plan, role, created_at, avatar_key, avatar_url } });
  } catch (err) {
    console.error('refresh error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function logout(req, res) {
  try {
    const cookieVal = (req.cookies && req.cookies.refresh_token) || null;
    const parsed = parseRefreshCookie(cookieVal);
    if (parsed && parsed.jti) {
      await revokeByJti(parsed.jti);
    }
    // Clear cookie
    const opts = buildRefreshCookieOptions(new Date(Date.now()));
    res.clearCookie('refresh_token', { path: opts.path });
    return res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('logout error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function me(req, res) {
  try {
    const userId = req.auth?.sub;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { id, email: uemail, first_name, last_name, country, created_at, plan, role, avatar_key } = user;
    let avatar_url = null;
    if (avatar_key) {
      try { avatar_url = await presignedGetObject(avatar_key, 900); } catch {}
    }
    return res.json({ user: { id, email: uemail, first_name, last_name, country, plan, role, created_at, avatar_key, avatar_url } });
  } catch (err) {
    console.error('me error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
};

const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';

function requireAuth(req, res, next) {
  const hdr = req.headers['authorization'] || '';
  const m = hdr.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ message: 'Missing token' });
  const token = m[1];
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.auth = payload; // { sub, role, plan, iat, exp }
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = { requireAuth };

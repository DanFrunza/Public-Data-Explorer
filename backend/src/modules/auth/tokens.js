const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const crypto = require('crypto');
const { saveRefreshToken, markRotated, revokeByJti } = require('./service');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TTL_SECONDS = parseTtlSeconds(process.env.REFRESH_TOKEN_TTL || '7d');

function parseTtlSeconds(ttl) {
  // Accept formats: '15m', '7d', '3600' (seconds)
  if (!ttl) return 3600;
  const m = String(ttl).match(/^(\d+)([smhd])?$/);
  if (!m) return Number(ttl) || 3600;
  const val = Number(m[1]);
  const unit = m[2] || 's';
  const mult = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
  return val * mult;
}

function signAccess(user) {
  const payload = {
    sub: String(user.id),
    role: user.role || 'user',
    plan: user.plan || 'free',
  };
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}

function composeRefreshValue(jti, rawToken) {
  // Cookie value combines jti and raw token
  return `${jti}.${rawToken}`;
}

async function issueRefresh(user, req) {
  const jti = crypto.randomUUID();
  const raw = crypto.randomBytes(32).toString('hex');
  const token_hash = await argon2.hash(raw);
  const expires_at = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000);
  const ip = req.ip || null;
  const user_agent = req.headers['user-agent'] || null;
  await saveRefreshToken({ user_id: user.id, jti, token_hash, expires_at, ip, user_agent });
  const value = composeRefreshValue(jti, raw);
  const cookieOptions = buildRefreshCookieOptions(expires_at);
  return { value, cookieOptions };
}

function buildRefreshCookieOptions(expires_at) {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd, // allow insecure in dev on localhost
    sameSite: 'Lax',
    path: '/api/auth/refresh',
    expires: expires_at,
  };
}

function parseRefreshCookie(cookieVal) {
  if (!cookieVal || typeof cookieVal !== 'string') return null;
  const parts = cookieVal.split('.');
  if (parts.length !== 2) return null;
  return { jti: parts[0], raw: parts[1] };
}

module.exports = {
  signAccess,
  issueRefresh,
  composeRefreshValue,
  parseRefreshCookie,
  buildRefreshCookieOptions,
};

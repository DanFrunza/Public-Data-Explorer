const argon2 = require('argon2');
const pool = require('../../db/pool');

async function createUser({ email, password, first_name, last_name, country }) {
  const password_hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const insertSql = `
    INSERT INTO users (email, password_hash, first_name, last_name, country)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, email, first_name, last_name, country, created_at;
  `;
  const values = [
    String(email).trim().toLowerCase(),
    password_hash,
    String(first_name).trim(),
    String(last_name).trim(),
    String(country).trim(),
  ];

  const result = await pool.query(insertSql, values);
  return result.rows[0];
}

async function findUserByEmail(email) {
  const sql = `SELECT * FROM users WHERE email = $1`;
  const res = await pool.query(sql, [String(email).trim().toLowerCase()]);
  return res.rows[0] || null;
}

async function findUserById(id) {
  const sql = `SELECT * FROM users WHERE id = $1`;
  const res = await pool.query(sql, [id]);
  return res.rows[0] || null;
}

async function verifyPassword(hash, plain) {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  saveRefreshToken,
  markRotated,
  revokeByJti,
  getRefreshTokenByJti,
};

async function saveRefreshToken({ user_id, jti, token_hash, expires_at, ip, user_agent }) {
  const insertSql = `
    INSERT INTO refresh_tokens (user_id, jti, token_hash, expires_at, created_at, ip, user_agent)
    VALUES ($1, $2, $3, $4, NOW(), $5, $6)
    RETURNING id
  `;
  const { rows } = await pool.query(insertSql, [user_id, jti, token_hash, expires_at, ip, user_agent]);
  return rows[0];
}

async function markRotated(jti) {
  const sql = `UPDATE refresh_tokens SET rotated_at = NOW() WHERE jti = $1`;
  await pool.query(sql, [jti]);
}

async function revokeByJti(jti) {
  const sql = `UPDATE refresh_tokens SET revoked_at = NOW() WHERE jti = $1`;
  await pool.query(sql, [jti]);
}

async function getRefreshTokenByJti(jti) {
  const sql = `
    SELECT id, user_id, jti, token_hash, expires_at, created_at, revoked_at, rotated_at
    FROM refresh_tokens
    WHERE jti = $1
  `;
  const { rows } = await pool.query(sql, [jti]);
  return rows[0] || null;
}

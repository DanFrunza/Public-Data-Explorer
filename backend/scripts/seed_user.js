require('dotenv').config();
const { Pool } = require('pg');
const argon2 = require('argon2');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to seed user');
  }
  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    const email = process.env.SEED_EMAIL || 'tester@example.com';
    const plain = process.env.SEED_PASSWORD || 'Test1234!';
    const first = process.env.SEED_FIRST || 'Test';
    const last = process.env.SEED_LAST || 'User';
    const country = process.env.SEED_COUNTRY || 'RO';

    const hash = await argon2.hash(plain, { type: argon2.argon2id });

    const sql = `
      INSERT INTO users (email, password_hash, first_name, last_name, country)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `;
    const params = [email, hash, first, last, country];
    const r = await client.query(sql, params);
    if (r.rows.length > 0) {
      console.log('[seed] Inserted user id:', r.rows[0].id, 'email:', email);
    } else {
      console.log('[seed] User already exists with email:', email);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[seed] Error:', err.message);
  process.exit(1);
});

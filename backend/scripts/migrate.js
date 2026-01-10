require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Require DATABASE_URL (Supabase Session Pooler). No local fallback.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is required for migrations.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations(client) {
  const res = await client.query('SELECT name FROM schema_migrations');
  return new Set(res.rows.map(r => r.name));
}

async function applyMigration(client, filePath, name) {
  const sql = fs.readFileSync(filePath, 'utf8');
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations(name) VALUES($1)', [name]);
    await client.query('COMMIT');
    console.log(`Applied: ${name}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Failed: ${name}`);
    throw err;
  }
}

async function run() {
  const client = await pool.connect();
  try {
    // Diagnostics: confirm which DB we're connected to (no secrets leaked)
    const diag = await client.query(
      'SELECT current_database() AS db, current_user AS user, inet_server_addr() AS server, version() AS ver'
    );
    const info = diag.rows[0] || {};
    const masked = connectionString.replace(/:\w+@/, ':***@');
    console.log('DB connection target:', masked);
    console.log('DB current_database:', info.db);
    console.log('DB user:', info.user);
    console.log('DB server addr:', info.server);
    console.log('DB version:', (info.ver || '').split('\n')[0]);

    const migrationsDir = path.join(__dirname, '..', 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found. Nothing to do.');
      return;
    }

    await ensureMigrationsTable(client);
    const applied = await getAppliedMigrations(client);

    const files = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`Skipping (already applied): ${file}`);
        continue;
      }
      const fullPath = path.join(migrationsDir, file);
      await applyMigration(client, fullPath, file);
    }

    console.log('Migrations complete.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

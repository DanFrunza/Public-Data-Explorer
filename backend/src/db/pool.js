require('dotenv').config();
const { Pool } = require('pg');

// Enforce Supabase via DATABASE_URL only
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required for backend database connection');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;

-- Add avatar-related fields to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_key TEXT,
  ADD COLUMN IF NOT EXISTS avatar_etag TEXT,
  ADD COLUMN IF NOT EXISTS avatar_updated_at TIMESTAMP;

-- Optional future index if querying by avatar_key becomes common
-- CREATE INDEX IF NOT EXISTS idx_users_avatar_key ON users(avatar_key);

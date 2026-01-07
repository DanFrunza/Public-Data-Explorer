-- Add plan and role to users with Postgres ENUMs
-- Safe to re-run: guards enum creation; ADD COLUMN uses IF NOT EXISTS

DO $$ BEGIN
  CREATE TYPE plan_type AS ENUM ('free', 'basic', 'premium');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan plan_type NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'user';

-- Optional: ensure updated_at tracks changes (trigger exists from 0002)
UPDATE users SET plan = plan, role = role;

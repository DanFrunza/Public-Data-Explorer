-- Optional profile fields and an updated_at column + trigger
ALTER TABLE users
  ADD COLUMN gender TEXT CHECK (gender IN ('male','female','nonbinary','other','prefer_not_to_say')),
  ADD COLUMN date_of_birth DATE,
  ADD COLUMN city TEXT,
  ADD COLUMN occupation TEXT,
  ADD COLUMN bio TEXT,
  ADD COLUMN phone TEXT,
  ADD COLUMN avatar_url TEXT,
  ADD COLUMN timezone TEXT,
  ADD COLUMN locale TEXT,
  ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

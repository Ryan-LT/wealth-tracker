-- WealthTracker cloud sync (Neon Postgres). Run once per project: Neon SQL Editor or `psql "$DATABASE_URL" -f db/schema.sql`
-- Upgrading a database created before multi-account login? Run db/migrations/2026-10-multi-user.sql instead.

-- bcrypt password hashing (`crypt` / `gen_salt`) so accounts can be created in plain SQL.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Login accounts. Add one with db/create-user.sql.
CREATE TABLE IF NOT EXISTS wealthtracker_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE CHECK (username = lower(username) AND char_length(username) BETWEEN 1 AND 64),
  display_name TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  /** Optional second sign-in name. */
  email TEXT CHECK (email = lower(email)),
  /** Sessions issued before this instant are void (set when the password changes). */
  password_changed_at TIMESTAMPTZ,
  /** Wrong passwords in a row; 5 locks the account for 15 minutes. */
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS wealthtracker_users_email_idx ON wealthtracker_users (email) WHERE email IS NOT NULL;

-- App tables (assets, debts, …) as one JSON document per user and key.
CREATE TABLE IF NOT EXISTS wealthtracker_kv (
  user_id UUID NOT NULL REFERENCES wealthtracker_users (id) ON DELETE CASCADE,
  key TEXT NOT NULL CHECK (char_length(key) > 0 AND char_length(key) <= 64),
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, key)
);

CREATE INDEX IF NOT EXISTS wealthtracker_kv_updated_at_idx ON wealthtracker_kv (updated_at DESC);

-- USD → VND rate from ExchangeRate-API (see `src/shared/api/usd-vnd-exchange-rate.ts`). Shared by all users; refreshed at most once per day.
CREATE TABLE IF NOT EXISTS wealthtracker_fx_cache (
  base_code TEXT NOT NULL,
  quote_code TEXT NOT NULL,
  rate NUMERIC(20, 8) NOT NULL CHECK (rate > 0),
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provider TEXT NOT NULL DEFAULT 'exchangerate-api',
  api_time_last_update_utc TIMESTAMPTZ,
  /** Provider `time_next_update_utc` — cache is valid until this instant when set. */
  api_time_next_update_utc TIMESTAMPTZ,
  PRIMARY KEY (base_code, quote_code)
);

CREATE INDEX IF NOT EXISTS wealthtracker_fx_cache_fetched_at_idx ON wealthtracker_fx_cache (fetched_at DESC);

-- Existing databases from before `api_time_next_update_utc`:
ALTER TABLE wealthtracker_fx_cache
  ADD COLUMN IF NOT EXISTS api_time_next_update_utc TIMESTAMPTZ;

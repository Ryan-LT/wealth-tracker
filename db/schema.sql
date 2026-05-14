-- WealthTracker cloud sync (Neon Postgres). Run once per project: Neon SQL Editor or `psql "$DATABASE_URL" -f db/schema.sql`

CREATE TABLE IF NOT EXISTS wealthtracker_kv (
  key TEXT PRIMARY KEY CHECK (char_length(key) > 0 AND char_length(key) <= 64),
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wealthtracker_kv_updated_at_idx ON wealthtracker_kv (updated_at DESC);

-- USD → VND rate from ExchangeRate-API (see `src/lib/usdVndExchangeRate.ts`). Refresh at most once per day when cached.
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

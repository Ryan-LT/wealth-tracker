-- WealthTracker cloud sync (Neon Postgres). Run once per project: Neon SQL Editor or `psql "$DATABASE_URL" -f db/schema.sql`

CREATE TABLE IF NOT EXISTS wealthtracker_kv (
  key TEXT PRIMARY KEY CHECK (char_length(key) > 0 AND char_length(key) <= 64),
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wealthtracker_kv_updated_at_idx ON wealthtracker_kv (updated_at DESC);

-- Per-network sign-in throttle (Oct 2026): 30 wrong passwords from one IP in 15 minutes → wait.
-- Run once in the Neon SQL Editor BEFORE deploying the app version that uses it. Additive and safe to re-run.
-- (If it hasn't run, sign-in still works; the throttle is just off and the app logs an error.)

CREATE TABLE IF NOT EXISTS wealthtracker_login_failures (
  /** HMAC of the client IP (never the raw address). */
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wealthtracker_login_failures_ip_idx ON wealthtracker_login_failures (ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS wealthtracker_login_failures_created_idx ON wealthtracker_login_failures (created_at DESC);

-- Self-service sign-up (Oct 2026): rate-limit log for the public /register page.
-- Run once in the Neon SQL Editor BEFORE deploying the app version with sign-up. Additive and safe to re-run.

CREATE TABLE IF NOT EXISTS wealthtracker_signup_attempts (
  /** HMAC of the client IP (never the raw address). */
  ip_hash TEXT NOT NULL,
  succeeded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wealthtracker_signup_attempts_ip_idx ON wealthtracker_signup_attempts (ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS wealthtracker_signup_attempts_created_idx ON wealthtracker_signup_attempts (created_at DESC);

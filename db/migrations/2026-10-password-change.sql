-- Self-service password change, sign-in by email, and lockout after repeated wrong passwords (Oct 2026).
-- Run once in the Neon SQL Editor BEFORE deploying the app version that uses it. Additive and safe to re-run.

BEGIN;

ALTER TABLE wealthtracker_users
  ADD COLUMN IF NOT EXISTS email TEXT CHECK (email = lower(email)),
  ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS wealthtracker_users_email_idx ON wealthtracker_users (email) WHERE email IS NOT NULL;

COMMIT;

-- Optional: let someone sign in with their email too.
--   UPDATE wealthtracker_users SET email = lower('someone@example.com') WHERE username = 'justin';

-- One-time upgrade from the single-login app to multi-account login (Oct 2026).
--
-- 1. Make sure every device has synced (no pending offline edits).
-- 2. Replace the owner username / display name / password below.
-- 3. Run this whole file in the Neon SQL Editor, then deploy the new app right away.
--
-- Existing data in wealthtracker_kv becomes the owner's data. Safe to re-run: every step is idempotent.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS wealthtracker_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE CHECK (username = lower(username) AND char_length(username) BETWEEN 1 AND 64),
  display_name TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The owner account (today's AUTH_USERNAME / AUTH_PASSWORD).
INSERT INTO wealthtracker_users (username, display_name, password_hash)
VALUES (lower('owner'), 'Owner', crypt('change-me-strong-password', gen_salt('bf', 12)))
ON CONFLICT (username) DO NOTHING;

ALTER TABLE wealthtracker_kv
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES wealthtracker_users (id) ON DELETE CASCADE;

-- Same username as the INSERT above.
UPDATE wealthtracker_kv
SET user_id = (SELECT id FROM wealthtracker_users WHERE username = lower('owner'))
WHERE user_id IS NULL;

ALTER TABLE wealthtracker_kv ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE wealthtracker_kv DROP CONSTRAINT IF EXISTS wealthtracker_kv_pkey;
ALTER TABLE wealthtracker_kv ADD CONSTRAINT wealthtracker_kv_pkey PRIMARY KEY (user_id, key);

-- Optional: carry the owner's "$1M by 35" settings over from the old env vars
-- (USER_DATE_OF_BIRTH / WEALTH_MILESTONE_TARGET_USD). Otherwise set them in Settings → Milestone goal.
-- UPDATE wealthtracker_kv
-- SET value = jsonb_set(value, '{milestone}', '{"birthDate": "1995-01-31", "targetUsd": 1000000, "targetAge": 35}'::jsonb),
--     updated_at = now()
-- WHERE key = 'preferences'
--   AND user_id = (SELECT id FROM wealthtracker_users WHERE username = lower('owner'));

COMMIT;

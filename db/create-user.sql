-- Add a login account. Replace the three values, then run it in the Neon SQL Editor.
-- The new account starts with no data; the person fills it in after signing in.
-- Usernames are case-insensitive (stored lowercase); the password is stored as a bcrypt hash.

INSERT INTO wealthtracker_users (username, display_name, password_hash)
VALUES (
  lower('alice'),                                -- username used to sign in
  'Alice Nguyen',                                -- name shown in the app (optional, can be NULL)
  crypt('change-me-strong-password', gen_salt('bf', 12))
);

-- Change a password:
--   UPDATE wealthtracker_users
--   SET password_hash = crypt('new-password', gen_salt('bf', 12))
--   WHERE username = 'alice';
--
-- Delete an account and all of its data:
--   DELETE FROM wealthtracker_users WHERE username = 'alice';

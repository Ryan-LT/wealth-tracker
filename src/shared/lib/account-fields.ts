/** Sign-up field rules, shared by the /register form (inline errors) and `POST /api/auth/register` (enforced). */

export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,31}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const DISPLAY_NAME_MAX = 60;

/** Usernames and emails are stored lowercase. */
export function normalizeSignInName(value: string): string {
  return value.trim().toLowerCase();
}

/** Error codes are translated with `t.errors[code]` (see `fieldErrorText`). */
export function validateUsername(raw: string): "username_length" | "username_chars" | null {
  const username = normalizeSignInName(raw);
  if (username.length < 3 || username.length > 32) return "username_length";
  if (!USERNAME_PATTERN.test(username)) return "username_chars";
  return null;
}

/** Email is optional: an empty value is valid. */
export function validateEmail(raw: string): "email_invalid" | null {
  const email = normalizeSignInName(raw);
  if (!email) return null;
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return "email_invalid";
  return null;
}

export function validateDisplayName(raw: string): "display_name_long" | null {
  return raw.trim().length > DISPLAY_NAME_MAX ? "display_name_long" : null;
}

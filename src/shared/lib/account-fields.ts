/** Sign-up field rules, shared by the /register form (inline errors) and `POST /api/auth/register` (enforced). */

export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,31}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const DISPLAY_NAME_MAX = 60;

/** Usernames and emails are stored lowercase. */
export function normalizeSignInName(value: string): string {
  return value.trim().toLowerCase();
}

export function validateUsername(raw: string): string | null {
  const username = normalizeSignInName(raw);
  if (username.length < 3 || username.length > 32) return "Use 3–32 characters.";
  if (!USERNAME_PATTERN.test(username)) return "Use letters, numbers, dots, dashes or underscores, starting with a letter or number.";
  return null;
}

/** Email is optional: an empty value is valid. */
export function validateEmail(raw: string): string | null {
  const email = normalizeSignInName(raw);
  if (!email) return null;
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return "Enter a valid email address, or leave it empty.";
  return null;
}

export function validateDisplayName(raw: string): string | null {
  return raw.trim().length > DISPLAY_NAME_MAX ? `Use at most ${DISPLAY_NAME_MAX} characters.` : null;
}

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;

/**
 * Rules for a new password; `null` when it is acceptable. Shared by the
 * Settings form (inline errors) and `POST /api/auth/password` (enforced).
 */
export function validateNewPassword(
  next: string,
  ctx: { current?: string; username?: string; email?: string | null } = {},
): string | null {
  if (next.length < PASSWORD_MIN_LENGTH) return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  if (next.length > PASSWORD_MAX_LENGTH) return `Use at most ${PASSWORD_MAX_LENGTH} characters.`;
  if (ctx.current !== undefined && next === ctx.current) return "Choose a password different from the current one.";
  const lowered = next.trim().toLowerCase();
  if ((ctx.username && lowered === ctx.username.toLowerCase()) || (ctx.email && lowered === ctx.email.toLowerCase())) {
    return "Don't use your username or email as the password.";
  }
  return null;
}

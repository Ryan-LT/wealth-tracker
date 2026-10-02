export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordProblem = "password_short" | "password_long" | "password_same" | "password_is_name";

/**
 * Rules for a new password; `null` when it is acceptable, else an error code
 * (`t.errors[code]`). Shared by the Settings / sign-up forms and the API.
 */
export function validateNewPassword(
  next: string,
  ctx: { current?: string; username?: string; email?: string | null } = {},
): PasswordProblem | null {
  if (next.length < PASSWORD_MIN_LENGTH) return "password_short";
  if (next.length > PASSWORD_MAX_LENGTH) return "password_long";
  if (ctx.current !== undefined && next === ctx.current) return "password_same";
  const lowered = next.trim().toLowerCase();
  if ((ctx.username && lowered === ctx.username.toLowerCase()) || (ctx.email && lowered === ctx.email.toLowerCase())) {
    return "password_is_name";
  }
  return null;
}

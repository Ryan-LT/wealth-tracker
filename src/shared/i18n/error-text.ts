import { DISPLAY_NAME_MAX } from "@/shared/lib/account-fields";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/shared/lib/password-policy";

import type { Messages } from "./messages/en";

export type ErrorCode = keyof Messages["errors"];

const LOCK_MINUTES = 15;

/** Message for an error / validation code, filling in the numbers some codes need. */
export function errorText(t: Messages, code: string | null | undefined, fallback?: string): string {
  const e = t.errors;
  switch (code) {
    case "locked":
      return e.locked({ minutes: LOCK_MINUTES });
    case "display_name_long":
      return e.display_name_long({ max: DISPLAY_NAME_MAX });
    case "password_short":
      return e.password_short({ min: PASSWORD_MIN_LENGTH });
    case "password_long":
      return e.password_long({ max: PASSWORD_MAX_LENGTH });
    case undefined:
    case null:
      return fallback ?? e.unavailable;
    default: {
      const v = (e as Record<string, unknown>)[code];
      return typeof v === "string" ? v : (fallback ?? e.unavailable);
    }
  }
}

/** Parse a failed API response into a translated message (and the field it belongs to). */
export async function apiErrorText(t: Messages, res: Response): Promise<{ message: string; field?: string }> {
  const data = (await res.json().catch(() => null)) as { error?: string; code?: string; field?: string } | null;
  return { message: errorText(t, data?.code, data?.error ?? e(t, res.status)), field: data?.field };
}

function e(t: Messages, status: number): string {
  return t.errors.generic({ status });
}

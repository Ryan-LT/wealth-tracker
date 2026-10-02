import { describe, expect, it } from "vitest";

import { validateNewPassword } from "@/shared/lib/password-policy";

describe("validateNewPassword", () => {
  it("accepts a long enough, new password", () => {
    expect(validateNewPassword("correct horse battery", { current: "old-password-1", username: "alice" })).toBeNull();
  });

  it("enforces length", () => {
    expect(validateNewPassword("short")).toBe("password_short");
    expect(validateNewPassword("x".repeat(129))).toBe("password_long");
  });

  it("rejects the current password", () => {
    expect(validateNewPassword("same-password-1", { current: "same-password-1" })).toBe("password_same");
  });

  it("rejects the username or email", () => {
    expect(validateNewPassword("alice-nguyen", { username: "Alice-Nguyen" })).toBe("password_is_name");
    expect(validateNewPassword("alice@example.com", { email: "alice@example.com" })).toBe("password_is_name");
  });
});

describe("validation codes have messages in both languages", () => {
  it("errorText fills in the limits", async () => {
    const { errorText } = await import("@/shared/i18n/error-text");
    const { en } = await import("@/shared/i18n/messages/en");
    const { vi } = await import("@/shared/i18n/messages/vi");
    expect(errorText(en, "password_short")).toBe("Use at least 10 characters.");
    expect(errorText(vi, "password_short")).toBe("Dùng ít nhất 10 ký tự.");
    expect(errorText(vi, "locked")).toContain("15 phút");
    expect(errorText(vi, "nope", "fallback")).toBe("fallback");
  });
});

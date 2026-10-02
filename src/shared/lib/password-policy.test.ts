import { describe, expect, it } from "vitest";

import { validateNewPassword } from "@/shared/lib/password-policy";

describe("validateNewPassword", () => {
  it("accepts a long enough, new password", () => {
    expect(validateNewPassword("correct horse battery", { current: "old-password-1", username: "alice" })).toBeNull();
  });

  it("enforces length", () => {
    expect(validateNewPassword("short")).toMatch(/at least 10/);
    expect(validateNewPassword("x".repeat(129))).toMatch(/at most 128/);
  });

  it("rejects the current password", () => {
    expect(validateNewPassword("same-password-1", { current: "same-password-1" })).toMatch(/different/);
  });

  it("rejects the username or email", () => {
    expect(validateNewPassword("alice-nguyen", { username: "Alice-Nguyen" })).toMatch(/username or email/);
    expect(validateNewPassword("alice@example.com", { email: "alice@example.com" })).toMatch(/username or email/);
  });
});

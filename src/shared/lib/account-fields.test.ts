import { describe, expect, it } from "vitest";

import { normalizeSignInName, validateDisplayName, validateEmail, validateUsername } from "@/shared/lib/account-fields";

describe("account fields", () => {
  it("normalizes sign-in names", () => {
    expect(normalizeSignInName("  Justin.Le ")).toBe("justin.le");
  });

  it("validates usernames", () => {
    expect(validateUsername("justin")).toBeNull();
    expect(validateUsername("J.Le_99")).toBeNull();
    expect(validateUsername("ab")).toMatch(/3–32/);
    expect(validateUsername("a".repeat(33))).toMatch(/3–32/);
    expect(validateUsername("-justin")).toMatch(/letters, numbers/);
    expect(validateUsername("jus tin")).toMatch(/letters, numbers/);
    expect(validateUsername("justin@x.com")).toMatch(/letters, numbers/);
  });

  it("treats email as optional", () => {
    expect(validateEmail("")).toBeNull();
    expect(validateEmail(" Justin@Example.com ")).toBeNull();
    expect(validateEmail("not-an-email")).toMatch(/valid email/);
  });

  it("limits display names", () => {
    expect(validateDisplayName("Justin Tran")).toBeNull();
    expect(validateDisplayName("x".repeat(61))).toMatch(/at most 60/);
  });
});

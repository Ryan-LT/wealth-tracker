import { describe, expect, it } from "vitest";

import { normalizeSignInName, validateDisplayName, validateEmail, validateUsername } from "@/shared/lib/account-fields";

describe("account fields", () => {
  it("normalizes sign-in names", () => {
    expect(normalizeSignInName("  Justin.Le ")).toBe("justin.le");
  });

  it("validates usernames", () => {
    expect(validateUsername("justin")).toBeNull();
    expect(validateUsername("J.Le_99")).toBeNull();
    expect(validateUsername("ab")).toBe("username_length");
    expect(validateUsername("a".repeat(33))).toBe("username_length");
    expect(validateUsername("-justin")).toBe("username_chars");
    expect(validateUsername("jus tin")).toBe("username_chars");
    expect(validateUsername("justin@x.com")).toBe("username_chars");
  });

  it("treats email as optional", () => {
    expect(validateEmail("")).toBeNull();
    expect(validateEmail(" Justin@Example.com ")).toBeNull();
    expect(validateEmail("not-an-email")).toBe("email_invalid");
  });

  it("limits display names", () => {
    expect(validateDisplayName("Justin Tran")).toBeNull();
    expect(validateDisplayName("x".repeat(61))).toBe("display_name_long");
  });
});

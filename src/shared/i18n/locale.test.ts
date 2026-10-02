import { describe, expect, it } from "vitest";

import { DEFAULT_LOCALE, isLocale, resolveLocale } from "@/shared/i18n/locale";

describe("resolveLocale", () => {
  it("defaults to Vietnamese", () => {
    expect(DEFAULT_LOCALE).toBe("vi");
    expect(resolveLocale(undefined)).toBe("vi");
    expect(resolveLocale(null)).toBe("vi");
    expect(resolveLocale("fr")).toBe("vi");
  });

  it("uses a chosen language", () => {
    expect(resolveLocale("en")).toBe("en");
    expect(resolveLocale("vi")).toBe("vi");
  });

  it("isLocale", () => {
    expect(isLocale("vi")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

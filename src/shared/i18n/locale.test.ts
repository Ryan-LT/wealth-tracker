import { describe, expect, it } from "vitest";

import { isLocale, negotiateLocale } from "@/shared/i18n/locale";

describe("negotiateLocale", () => {
  it("follows the browser", () => {
    expect(negotiateLocale("vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7")).toBe("vi");
    expect(negotiateLocale("en-US,en;q=0.9")).toBe("en");
    expect(negotiateLocale("fr-FR,fr;q=0.9,vi;q=0.5")).toBe("vi");
    expect(negotiateLocale("fr-FR,de;q=0.9")).toBe("en");
  });

  it("respects weights, order and q=0", () => {
    expect(negotiateLocale("en;q=0.5,vi;q=0.8")).toBe("vi");
    expect(negotiateLocale("vi;q=0,en")).toBe("en");
    expect(negotiateLocale("VI")).toBe("vi");
  });

  it("defaults to English without a header", () => {
    expect(negotiateLocale(null)).toBe("en");
    expect(negotiateLocale("")).toBe("en");
    expect(negotiateLocale("*")).toBe("en");
  });

  it("isLocale", () => {
    expect(isLocale("vi")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

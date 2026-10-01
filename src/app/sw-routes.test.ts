import { describe, expect, it } from "vitest";

import { SHELL_ROUTES } from "@/app/sw-routes";
import { NAV } from "@/shared/config/nav";

describe("service worker shell routes", () => {
  it("pre-caches every navigable page", () => {
    for (const item of NAV) {
      expect(SHELL_ROUTES).toContain(item.href);
    }
  });
});

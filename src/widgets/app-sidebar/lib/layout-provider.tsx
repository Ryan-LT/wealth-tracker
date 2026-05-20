"use client";

import * as React from "react";

type Collapsible = "offcanvas" | "icon" | "none";
type Variant = "inset" | "sidebar" | "floating";

type LayoutContextValue = {
  collapsible: Collapsible;
  variant: Variant;
  setCollapsible: (value: Collapsible) => void;
  setVariant: (value: Variant) => void;
  resetLayout: () => void;
};

const LAYOUT_COLLAPSIBLE_COOKIE = "layout_collapsible";
const LAYOUT_VARIANT_COOKIE = "layout_variant";
const COOKIE_AGE = 60 * 60 * 24 * 365;

const LayoutContext = React.createContext<LayoutContextValue | null>(null);

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1];
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_AGE}`;
}

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [collapsible, setCollapsibleState] = React.useState<Collapsible>(
    () => (readCookie(LAYOUT_COLLAPSIBLE_COOKIE) as Collapsible | undefined) ?? "icon",
  );
  const [variant, setVariantState] = React.useState<Variant>(
    () => (readCookie(LAYOUT_VARIANT_COOKIE) as Variant | undefined) ?? "inset",
  );

  const setCollapsible = React.useCallback((value: Collapsible) => {
    setCollapsibleState(value);
    writeCookie(LAYOUT_COLLAPSIBLE_COOKIE, value);
  }, []);

  const setVariant = React.useCallback((value: Variant) => {
    setVariantState(value);
    writeCookie(LAYOUT_VARIANT_COOKIE, value);
  }, []);

  const resetLayout = React.useCallback(() => {
    setCollapsible("icon");
    setVariant("inset");
  }, [setCollapsible, setVariant]);

  const value = React.useMemo(
    () => ({ collapsible, variant, setCollapsible, setVariant, resetLayout }),
    [collapsible, variant, setCollapsible, setVariant, resetLayout],
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
  const ctx = React.useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used within LayoutProvider");
  return ctx;
}

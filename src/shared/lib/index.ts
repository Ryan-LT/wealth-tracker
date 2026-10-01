// Entity-agnostic helpers only. Domain logic lives in `@/entities/<name>`.
export { cn, getDisplayNameInitials } from "./cn";
export { useIsMobile, useMediaQuery } from "./use-media-query";
export * from "./format";
export type { StatusTone } from "./tone";

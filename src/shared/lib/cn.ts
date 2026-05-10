// Intentionally permissive — accepts whatever falsy expression the caller hands
// us (including `bigint` values that React 19's `ReactNode` introduces). Truthy
// strings and numbers are stringified; truthy arrays/objects are walked.
type ClassValue = unknown;

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const value of inputs) {
    if (!value) continue;
    if (typeof value === "string") {
      out.push(value);
    } else if (typeof value === "number" || typeof value === "bigint") {
      out.push(String(value));
    } else if (Array.isArray(value)) {
      const inner = cn(...(value as ClassValue[]));
      if (inner) out.push(inner);
    } else if (typeof value === "object") {
      for (const [key, on] of Object.entries(value as Record<string, unknown>)) {
        if (on) out.push(key);
      }
    }
  }
  return out.join(" ");
}

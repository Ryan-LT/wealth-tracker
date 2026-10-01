import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type FetchMock = ReturnType<typeof vi.fn>;

function installBrowser(fetchImpl: FetchMock) {
  const storage = new Map<string, string>();
  vi.stubGlobal("window", {
    fetch: fetchImpl,
    localStorage: {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => void storage.set(k, v),
    },
  });
  vi.stubGlobal("fetch", fetchImpl);
}

beforeEach(() => {
  vi.resetModules();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("flushTablesNow", () => {
  it("resolves false instead of looping forever when the server is unreachable", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("offline"));
    installBrowser(fetchMock);
    const store = await import("@/shared/storage/store");
    store.writeTable("debts", [{ id: "d1" }]);
    await expect(store.flushTablesNow()).resolves.toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("PUTs only dirty tables and resolves true", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    installBrowser(fetchMock);
    const store = await import("@/shared/storage/store");
    store.writeTable("personalLoans", [{ id: "loan-1" }]);
    await expect(store.flushTablesNow()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/tables");
    expect(init.method).toBe("PUT");
    expect(JSON.parse(String(init.body))).toEqual({ tables: { personalLoans: [{ id: "loan-1" }] } });
    await expect(store.flushTablesNow()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("retry backoff", () => {
  it("backs off failed retries but flushes user edits after the short debounce", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("offline"));
    installBrowser(fetchMock);
    const store = await import("@/shared/storage/store");
    store.writeTable("debts", [{ id: "d1" }]);
    await vi.advanceTimersByTimeAsync(400); // debounce → attempt 1 fails
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(799); // retry waits 800 ms
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1); // attempt 2 fails
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1_599); // next retry waits 1600 ms
    expect(fetchMock).toHaveBeenCalledTimes(2);
    store.writeTable("debts", [{ id: "d2" }]); // new edit → short debounce again
    await vi.advanceTimersByTimeAsync(400);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});

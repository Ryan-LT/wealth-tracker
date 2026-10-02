import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type FetchMock = ReturnType<typeof vi.fn>;

function installBrowser(fetchImpl: FetchMock, storage = new Map<string, string>()) {
  vi.stubGlobal("window", {
    fetch: fetchImpl,
    localStorage: {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => void storage.set(k, v),
    },
  });
  vi.stubGlobal("fetch", fetchImpl);
  return storage;
}

const ok = (body: unknown) => ({ ok: true, json: async () => body });

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

describe("unsynced edits", () => {
  it("survive a reload and win over the server copy on the next sync", async () => {
    const storage = installBrowser(vi.fn().mockRejectedValue(new TypeError("offline")));
    let store = await import("@/shared/storage/store");
    store.writeTable("personalLoans", [{ id: "offline-edit" }]);
    await expect(store.flushTablesNow()).resolves.toBe(false);

    // Reload: fresh module state, same localStorage, server reachable again.
    vi.resetModules();
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) =>
      init?.method === "PUT"
        ? ok({ ok: true })
        : ok({ tables: { personalLoans: [{ id: "server" }], debts: [{ id: "server-debt" }] } }),
    );
    installBrowser(fetchMock, storage);
    store = await import("@/shared/storage/store");
    expect(store.readTable("personalLoans", [])).toEqual([{ id: "offline-edit" }]);
    await store.backgroundRefetchTables();
    expect(store.readTable("personalLoans", [])).toEqual([{ id: "offline-edit" }]);
    expect(store.readTable("debts", [])).toEqual([{ id: "server-debt" }]);
    await expect(store.flushTablesNow()).resolves.toBe(true);
    const put = fetchMock.mock.calls.find(([, init]) => init?.method === "PUT");
    expect(JSON.parse(String(put?.[1]?.body))).toEqual({ tables: { personalLoans: [{ id: "offline-edit" }] } });
    expect(JSON.parse(storage.get("wealthtracker:tables:v1") ?? "{}").dirty).toEqual([]);
  });

  it("stay dirty when the table is edited again while its PUT is in flight", async () => {
    let release!: () => void;
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => new Promise((resolve) => (release = () => resolve(ok({ ok: true })))))
      .mockResolvedValue(ok({ ok: true }));
    installBrowser(fetchMock);
    const store = await import("@/shared/storage/store");
    store.writeTable("debts", [{ id: "first" }]);
    const flushed = store.flushTablesNow();
    store.writeTable("debts", [{ id: "second" }]);
    release();
    await expect(flushed).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const bodies = fetchMock.mock.calls.map(([, init]) => JSON.parse(String((init as RequestInit).body)));
    expect(bodies.at(-1)).toEqual({ tables: { debts: [{ id: "second" }] } });
  });
});

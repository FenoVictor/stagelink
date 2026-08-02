import { describe, it, expect, beforeEach } from "vitest";
import { getCached, setCache, clearCache, withCache } from "../utils/cache";

beforeEach(() => {
  localStorage.clear();
});

describe("cache utils", () => {
  it("setCache and getCached roundtrip", () => {
    setCache("test-key", { name: "test" });
    expect(getCached("test-key")).toEqual({ name: "test" });
  });

  it("getCached returns null for missing key", () => {
    expect(getCached("nonexistent")).toBeNull();
  });

  it("getCached returns null for expired entry", () => {
    setCache("expired-key", "data", -1);
    expect(getCached("expired-key")).toBeNull();
  });

  it("clearCache removes specific key", () => {
    setCache("key1", "value1");
    setCache("key2", "value2");
    clearCache("key1");
    expect(getCached("key1")).toBeNull();
    expect(getCached("key2")).toEqual("value2");
  });

  it("clearCache without key removes all cached entries", () => {
    setCache("key1", "value1");
    setCache("key2", "value2");
    clearCache();
    expect(getCached("key1")).toBeNull();
    expect(getCached("key2")).toBeNull();
  });

  it("withCache calls fetcher on cache miss", async () => {
    let callCount = 0;
    const fetcher = async () => { callCount++; return "fresh"; };
    const result = await withCache("fresh-key", fetcher);
    expect(result).toBe("fresh");
    expect(callCount).toBe(1);
  });

  it("withCache returns cached value without calling fetcher", async () => {
    let callCount = 0;
    setCache("cached-key", "cached-data");
    const fetcher = async () => { callCount++; return "fresh"; };
    const result = await withCache("cached-key", fetcher);
    expect(result).toBe("cached-data");
    expect(callCount).toBe(0);
  });
});

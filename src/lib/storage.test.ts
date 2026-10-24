import { describe, expect, it, vi } from "vitest";
import { createSafeStorage } from "./storage";

const memoryStorage = () => {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
  };
};

describe("createSafeStorage", () => {
  it("reads and writes through to the real storage", () => {
    const backing = memoryStorage();
    const storage = createSafeStorage(() => backing, vi.fn());
    storage.setItem("k", "v");
    expect(storage.getItem("k")).toBe("v");
    storage.removeItem("k");
    expect(storage.getItem("k")).toBeNull();
  });

  it("reports a full storage instead of throwing", () => {
    const onError = vi.fn();
    const full = {
      ...memoryStorage(),
      setItem: () => {
        throw new DOMException("full", "QuotaExceededError");
      },
    };
    const storage = createSafeStorage(() => full, onError);

    expect(() => storage.setItem("k", "big")).not.toThrow();
    expect(onError).toHaveBeenCalledOnce();
  });

  it("acts empty when storage is unavailable (private mode, SSR)", () => {
    const storage = createSafeStorage(() => {
      throw new Error("no storage");
    }, vi.fn());
    expect(storage.getItem("k")).toBeNull();
    expect(() => storage.setItem("k", "v")).not.toThrow();
  });
});

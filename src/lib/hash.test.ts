import { describe, expect, it } from "vitest";
import { hashString } from "./hash";

describe("hashString", () => {
  it("returns the same unsigned 32-bit hash for the same text", () => {
    const hash = hashString("ramen");
    expect(hash).toBe(hashString("ramen"));
    expect(Number.isInteger(hash) && hash >= 0 && hash <= 0xffffffff).toBe(true);
  });

  it("distinguishes nearby strings", () => {
    expect(hashString("ramen#1")).not.toBe(hashString("ramen#2"));
  });

  it("matches the FNV-1a reference value", () => {
    // FNV-1a 32-bit of "a" is 0xe40c292c
    expect(hashString("a")).toBe(0xe40c292c);
  });
});

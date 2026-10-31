import { describe, expect, it } from "vitest";
import { isDoubleTap } from "./doubleTap";

const first = { x: 100, y: 100, time: 1000 };

describe("isDoubleTap", () => {
  it("is a quick second tap in the same spot", () => {
    expect(isDoubleTap(first, { x: 110, y: 95, time: 1250 })).toBe(true);
  });

  it("is not a slow second tap", () => {
    expect(isDoubleTap(first, { x: 100, y: 100, time: 1400 })).toBe(false);
  });

  it("is not a tap somewhere else", () => {
    expect(isDoubleTap(first, { x: 200, y: 100, time: 1100 })).toBe(false);
  });

  it("needs a first tap", () => {
    expect(isDoubleTap(null, first)).toBe(false);
  });
});

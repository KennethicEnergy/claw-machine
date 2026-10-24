import { describe, expect, it } from "vitest";
import { fitFontSize } from "./fitFontSize";

/** Fake measure: every character is 0.6em wide. */
const measure = (text: string, size: number) => text.length * size * 0.6;

describe("fitFontSize", () => {
  it("keeps the starting size when the text already fits", () => {
    expect(
      fitFontSize({ text: "Pizza", maxWidth: 200, start: 56, min: 20, measure }),
    ).toBe(56);
  });

  it("shrinks long text until it fits", () => {
    // 10 chars * 0.6 = 6 units per px of font; 200 / 6 = 33.3 -> 32 in steps of 2
    expect(
      fitFontSize({ text: "Breakfasts", maxWidth: 200, start: 56, min: 20, measure }),
    ).toBe(32);
  });

  it("never goes below the minimum size", () => {
    expect(
      fitFontSize({ text: "x".repeat(80), maxWidth: 200, start: 56, min: 20, measure }),
    ).toBe(20);
  });
});

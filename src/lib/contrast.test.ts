import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

describe("contrastRatio (WCAG 2)", () => {
  it("is 21 for black on white and 1 for a color on itself", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#6B7A2E", "#6B7A2E")).toBeCloseTo(1, 5);
  });

  it("does not care which color is in front", () => {
    expect(contrastRatio("#2F3A17", "#F4F1E1")).toBeCloseTo(
      contrastRatio("#F4F1E1", "#2F3A17"),
      10,
    );
  });

  it("matches the WCAG reference value for mid grey on white", () => {
    // #777777 on white is the classic 4.48:1 example
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
  });
});

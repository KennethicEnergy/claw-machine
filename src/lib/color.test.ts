import { describe, expect, it } from "vitest";
import { mixHex } from "./color";

describe("mixHex", () => {
  it("returns the first color at 0 and the second at 1", () => {
    expect(mixHex("#2F3A17", "#F4F1E1", 0)).toBe("#2f3a17");
    expect(mixHex("#2F3A17", "#F4F1E1", 1)).toBe("#f4f1e1");
  });

  it("blends each channel in between", () => {
    expect(mixHex("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(mixHex("#ff0000", "#0000ff", 0.25)).toBe("#bf0040");
  });
});

import { describe, expect, it } from "vitest";
import { isFilled, isOptionalImageUrl, isOptionalWebLink, isPin } from "./validators";

describe("editor validators", () => {
  it("requires some non-space text", () => {
    expect(isFilled("Ramen")).toBe(true);
    expect(isFilled("   ")).toBe(false);
  });

  it("accepts an empty link or a web link", () => {
    expect(isOptionalWebLink("")).toBe(true);
    expect(isOptionalWebLink("https://maps.google.com")).toBe(true);
    expect(isOptionalWebLink("javascript:alert(1)")).toBe(false);
  });

  it("accepts an empty image, a web image or an uploaded one", () => {
    expect(isOptionalImageUrl("")).toBe(true);
    expect(isOptionalImageUrl("https://example.com/a.jpg")).toBe(true);
    expect(isOptionalImageUrl("data:image/png;base64,AA")).toBe(true);
    expect(isOptionalImageUrl("ftp://x")).toBe(false);
  });

  it("takes a PIN of 4 to 8 digits", () => {
    expect(isPin("1234")).toBe(true);
    expect(isPin("123")).toBe(false);
    expect(isPin("12a4")).toBe(false);
  });
});

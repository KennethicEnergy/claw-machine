import { describe, expect, it } from "vitest";
import { makeConfig } from "@/test/fixtures";
import { themeToCssVars } from "./theme";

describe("themeToCssVars", () => {
  it("maps every palette color onto its Tailwind variable", () => {
    const vars = themeToCssVars({
      ...makeConfig().theme,
      olive500: "#123456",
      gold: "#ABCDEF",
    });
    expect(vars["--color-olive-500"]).toBe("#123456");
    expect(vars["--color-gold"]).toBe("#ABCDEF");
    expect(Object.keys(vars)).toHaveLength(9);
  });
});

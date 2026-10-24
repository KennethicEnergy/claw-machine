import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";
import { DEFAULT_THEME, TEXT_PAIRS, THEME_CSS_VARS } from "./theme";

describe("DEFAULT_THEME", () => {
  it("matches the CSS variables in globals.css so DOM and 3D colors agree", () => {
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
    for (const [key, variable] of Object.entries(THEME_CSS_VARS)) {
      const color = DEFAULT_THEME[key as keyof typeof DEFAULT_THEME];
      expect(css.toLowerCase()).toContain(`${variable}: ${color.toLowerCase()};`);
    }
  });

  it.each(TEXT_PAIRS)(
    "keeps %s text readable on %s (WCAG AA 4.5:1)",
    (text, background) => {
      expect(
        contrastRatio(DEFAULT_THEME[text], DEFAULT_THEME[background]),
      ).toBeGreaterThanOrEqual(4.5);
    },
  );
});

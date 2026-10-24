import { THEME_CSS_VARS } from "@/config/theme";
import type { ThemePalette } from "@/game/types";

/** Palette to `--color-*` custom properties, so Tailwind classes follow the config. */
export const themeToCssVars = (theme: ThemePalette): Record<string, string> =>
  Object.fromEntries(
    (Object.keys(THEME_CSS_VARS) as (keyof ThemePalette)[]).map((key) => [
      THEME_CSS_VARS[key],
      theme[key],
    ]),
  );

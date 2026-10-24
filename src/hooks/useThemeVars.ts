import { useEffect } from "react";
import type { ThemePalette } from "@/game/types";
import { themeToCssVars } from "@/lib/theme";

/** Pushes the configured palette into the CSS variables behind the Tailwind colors. */
export const useThemeVars = (theme: ThemePalette) => {
  useEffect(() => {
    const { style } = document.documentElement;
    Object.entries(themeToCssVars(theme)).forEach(([name, value]) =>
      style.setProperty(name, value),
    );
  }, [theme]);
};

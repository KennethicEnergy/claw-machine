import type { ThemePalette } from "@/game/types";

/** Olive-to-medium-olive palette with one warm gold accent. Mirrors globals.css. */
export const DEFAULT_THEME: ThemePalette = {
  olive900: "#2F3A17",
  olive700: "#4B5A22",
  olive500: "#6B7A2E",
  olive400: "#808F3C",
  olive300: "#A3B15A",
  olive100: "#E4E9C8",
  cream: "#F4F1E1",
  gold: "#C9A24B",
  terracotta: "#B9785F",
};

/** Tailwind theme variable behind each palette key. */
export const THEME_CSS_VARS: Record<keyof ThemePalette, string> = {
  olive900: "--color-olive-900",
  olive700: "--color-olive-700",
  olive500: "--color-olive-500",
  olive400: "--color-olive-400",
  olive300: "--color-olive-300",
  olive100: "--color-olive-100",
  cream: "--color-cream",
  gold: "--color-gold",
  terracotta: "--color-terracotta",
};

/**
 * Every text-on-background pair the UI uses. Mid greens (olive-500 and lighter)
 * and terracotta are for fills and accents only, never for text.
 */
export const TEXT_PAIRS: readonly [keyof ThemePalette, keyof ThemePalette][] = [
  ["olive900", "cream"],
  ["olive900", "olive100"],
  ["olive700", "cream"],
  ["olive700", "olive100"],
  ["cream", "olive700"],
  ["cream", "olive900"],
  ["olive900", "gold"],
];

/** Warm light that fills the inside of the cabinet. */
export const INTERIOR_LIGHT = "#FFE2B0";

/** Preset swatches offered in the prize color pickers. */
export const PRIZE_SWATCHES = [
  "#A3B15A",
  "#808F3C",
  "#6B7A2E",
  "#C8D18F",
  "#E4E9C8",
  "#F4F1E1",
  "#C9A24B",
  "#E2C47E",
  "#B9785F",
  "#D9A48C",
] as const;

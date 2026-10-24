const linear = (channel: number) => {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

/** WCAG relative luminance of a #rrggbb color. */
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((start) =>
    linear(Number.parseInt(hex.slice(start, start + 2), 16)),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG 2 contrast ratio between two colors, from 1 (none) to 21 (black on white). */
export const contrastRatio = (a: string, b: string) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

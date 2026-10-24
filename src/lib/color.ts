const channels = (hex: string) =>
  [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));

/** Linear sRGB blend of two #rrggbb colors; `amount` 0 = first, 1 = second. */
export const mixHex = (from: string, to: string, amount: number) => {
  const a = channels(from);
  const b = channels(to);
  return `#${a
    .map((value, index) =>
      Math.round(value + (b[index] - value) * amount)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
};

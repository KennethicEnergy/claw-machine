/** Picks a line deterministically so the same attempt always says the same thing. */
export const pickLine = (lines: readonly string[], index: number) =>
  lines[Math.abs(index) % lines.length];

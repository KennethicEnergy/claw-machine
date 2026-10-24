type FitFontSize = {
  text: string;
  maxWidth: number;
  start: number;
  min: number;
  /** Width of `text` at font `size`, e.g. via CanvasRenderingContext2D.measureText. */
  measure: (text: string, size: number) => number;
};

/** Largest font size (in steps of 2) at which `text` fits in `maxWidth`. */
export const fitFontSize = ({ text, maxWidth, start, min, measure }: FitFontSize) => {
  let size = start;
  while (size > min && measure(text, size) > maxWidth) size -= 2;
  return Math.max(min, size);
};

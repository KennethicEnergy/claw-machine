/** Scales width x height down (never up) so the longest side is at most `max`. */
export const fitWithin = (width: number, height: number, max: number) => {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
};

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("That image could not be read."));
    image.src = url;
  });

/**
 * Shrinks an uploaded photo to a small JPEG data URL so it fits in localStorage
 * alongside the rest of the config.
 */
export const imageFileToDataUrl = async (file: File, maxSide = 640, quality = 0.82) => {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const { width, height } = fitWithin(image.naturalWidth, image.naturalHeight, maxSide);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

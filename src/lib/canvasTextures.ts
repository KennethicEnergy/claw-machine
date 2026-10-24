import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import { fitFontSize } from "./fitFontSize";

/** The page font (Nunito via next/font), so canvas text matches the UI. */
const pageFont = () => getComputedStyle(document.body).fontFamily || "sans-serif";

const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is not available");
  return { canvas, context };
};

const toTexture = (canvas: HTMLCanvasElement) => {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const fitText = (
  context: CanvasRenderingContext2D,
  text: string,
  {
    maxWidth,
    start,
    min,
    weight,
  }: { maxWidth: number; start: number; min: number; weight: number },
) => {
  const font = pageFont();
  const size = fitFontSize({
    text,
    maxWidth,
    start,
    min,
    measure: (value, fontSize) => {
      context.font = `${weight} ${fontSize}px ${font}`;
      return context.measureText(value).width;
    },
  });
  context.font = `${weight} ${size}px ${font}`;
};

type TagColors = { background: string; foreground: string; border: string };

/** Rounded sticker with the prize label, 256x112. */
export const createLabelTexture = (
  text: string,
  { background, foreground, border }: TagColors,
) => {
  const { canvas, context } = createCanvas(256, 112);
  context.fillStyle = background;
  context.strokeStyle = border;
  context.lineWidth = 7;
  context.beginPath();
  context.roundRect(6, 6, 244, 100, 32);
  context.fill();
  context.stroke();
  fitText(context, text, { maxWidth: 206, start: 54, min: 18, weight: 800 });
  context.fillStyle = foreground;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 128, 60);
  return toTexture(canvas);
};

type SignColors = { panel: string; text: string; accent: string };

/** Marquee sign with the machine title and two little hearts, 1024x256. */
export const createSignTexture = (title: string, { panel, text, accent }: SignColors) => {
  const { canvas, context } = createCanvas(1024, 256);
  context.fillStyle = panel;
  context.beginPath();
  context.roundRect(8, 8, 1008, 240, 64);
  context.fill();
  fitText(context, title, { maxWidth: 760, start: 120, min: 40, weight: 900 });
  context.fillStyle = text;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(title, 512, 136);
  context.fillStyle = accent;
  context.font = `64px ${pageFont()}`;
  context.fillText("♥", 76, 132);
  context.fillText("♥", 948, 132);
  return toTexture(canvas);
};

/** Tiny repeating polka-dot tile for the back wall. */
export const createDotsTexture = (
  base: string,
  dot: string,
  repeatX: number,
  repeatY: number,
) => {
  const { canvas, context } = createCanvas(128, 128);
  context.fillStyle = base;
  context.fillRect(0, 0, 128, 128);
  context.fillStyle = dot;
  for (const [x, y] of [
    [32, 32],
    [96, 96],
  ]) {
    context.beginPath();
    context.arc(x, y, 9, 0, Math.PI * 2);
    context.fill();
  }
  const texture = toTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  return texture;
};

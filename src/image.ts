import startImage from "../public/img/start.jpg";

type RGB = { r: number; g: number; b: number };

const FALLBACK_ACCENT: RGB = { r: 0x15, g: 0x80, b: 0x3d };
const SAMPLE_SIZE = 100;

const canvas_image = document.getElementById(
  "canvas-image",
) as HTMLCanvasElement | null;

const image = new Image();

export function getAccentColorFromImage(onAccent: (hexColor: string) => void) {
  if (!canvas_image) return;

  image.onload = () => {
    drawImage();
    window.addEventListener("resize", onResize);

    const { accent_rgb, bg_rgb } = get_avg_color(sampleImage());

    const root = document.documentElement.style;
    root.setProperty("--accent", toCss(accent_rgb));
    root.setProperty("--bg", toCss(bg_rgb));

    onAccent(rgbToHex(accent_rgb));
  };

  image.src = startImage;
}

// Farben aus einer kleinen Offscreen-Kopie lesen, unabhängig von der Anzeigegröße
function sampleImage(): ImageData {
  const sample = document.createElement("canvas");
  sample.width = SAMPLE_SIZE;
  sample.height = SAMPLE_SIZE;
  const ctx = sample.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  return ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
}

function get_avg_color(image: ImageData) {
  let totalWeight = 0;
  let weightedR = 0,
    weightedG = 0,
    weightedB = 0;

  let bg_rgb: RGB = FALLBACK_ACCENT;
  let bestSaturation: number = 0;

  const data = image.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r < 30 && g < 30 && b < 30) continue;
    if (r > 225 && g > 225 && b > 225) continue;

    const weight = getSaturation(r, g, b);
    if (weight < 0.1) continue;
    weightedR += r * weight;
    weightedG += g * weight;
    weightedB += b * weight;
    totalWeight += weight;

    if (weight > bestSaturation) {
      bestSaturation = weight;
      bg_rgb = { r, g, b };
    }
  }

  if (totalWeight === 0) {
    return { accent_rgb: FALLBACK_ACCENT, bg_rgb };
  }

  const accent_rgb = {
    r: Math.floor(weightedR / totalWeight),
    g: Math.floor(weightedG / totalWeight),
    b: Math.floor(weightedB / totalWeight),
  };

  return { accent_rgb, bg_rgb };
}

function getSaturation(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  if (max === 0) return 0;
  return (max - min) / max;
}

function drawImage() {
  if (!canvas_image) return;
  const dpr = window.devicePixelRatio || 1;
  const width = Math.round(canvas_image.clientWidth * dpr);
  const height = Math.round(canvas_image.clientHeight * dpr);
  canvas_image.width = width;
  canvas_image.height = height;
  canvas_image.getContext("2d")?.drawImage(image, 0, 0, width, height);
}

let resizeFrame = 0;
function onResize() {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(drawImage);
}

function toCss({ r, g, b }: RGB): string {
  return `rgb(${r},${g},${b})`;
}

function rgbToHex({ r, g, b }: RGB): string {
  const hr = r.toString(16).padStart(2, "0");
  const hg = g.toString(16).padStart(2, "0");
  const hb = b.toString(16).padStart(2, "0");
  return `#${hr}${hg}${hb}`;
}

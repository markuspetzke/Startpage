import images from "virtual:images";

export type RGB = { r: number; g: number; b: number };

const FALLBACK_ACCENT: RGB = { r: 0x15, g: 0x80, b: 0x3d };
const SAMPLE_SIZE = 100;

// Zeigt ein zufälliges Bild aus public/img, setzt --accent/--bg und gibt die Akzentfarbe zurück
export async function loadRandomImage(img: HTMLImageElement): Promise<RGB> {
  if (images.length === 0) return FALLBACK_ACCENT;

  img.src = images[Math.floor(Math.random() * images.length)];
  try {
    await img.decode();
  } catch {
    return FALLBACK_ACCENT;
  }

  const { accent, bg } = getImageColors(sampleImage(img));

  const root = document.documentElement.style;
  root.setProperty("--accent", toCss(accent));
  root.setProperty("--bg", toCss(bg));

  return accent;
}

export function toCss({ r, g, b }: RGB): string {
  return `rgb(${r},${g},${b})`;
}

// Farben aus einer kleinen Offscreen-Kopie lesen, unabhängig von der Bildgröße
function sampleImage(img: HTMLImageElement): ImageData {
  const sample = document.createElement("canvas");
  sample.width = SAMPLE_SIZE;
  sample.height = SAMPLE_SIZE;
  const ctx = sample.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  return ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
}

// accent: nach Sättigung gewichteter Durchschnitt, bg: gesättigtster Pixel
function getImageColors({ data }: ImageData) {
  let totalWeight = 0;
  let weightedR = 0;
  let weightedG = 0;
  let weightedB = 0;

  let bg = FALLBACK_ACCENT;
  let bestSaturation = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r < 30 && g < 30 && b < 30) continue;
    if (r > 225 && g > 225 && b > 225) continue;

    const saturation = getSaturation(r, g, b);
    if (saturation < 0.1) continue;
    weightedR += r * saturation;
    weightedG += g * saturation;
    weightedB += b * saturation;
    totalWeight += saturation;

    if (saturation > bestSaturation) {
      bestSaturation = saturation;
      bg = { r, g, b };
    }
  }

  if (totalWeight === 0) return { accent: FALLBACK_ACCENT, bg };

  const accent = {
    r: Math.floor(weightedR / totalWeight),
    g: Math.floor(weightedG / totalWeight),
    b: Math.floor(weightedB / totalWeight),
  };
  return { accent, bg };
}

function getSaturation(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

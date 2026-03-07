import startImage from "../public/img/start.jpg";
let ACCENT_COLOR: string = "#15803d";
let canvas_image: HTMLCanvasElement = document.getElementById(
  "canvas-image",
) as HTMLCanvasElement;

export function getAccentColorFromImage(onAccent: (hexColor: string) => void) {
  if (!canvas_image) return;

  const ctx = canvas_image.getContext("2d");
  const width = canvas_image.clientWidth;
  const height = canvas_image.clientHeight;
  canvas_image.width = width;
  canvas_image.height = height;

  if (!ctx) return;

  const image = new Image();
  image.onload = () => {
    ctx.drawImage(image, 0, 0, width, height);
    const { accent_rgb, bg_rgb } = get_avg_color(
      ctx.getImageData(0, 0, width, height),
    );
    ACCENT_COLOR = rgbToHex(accent_rgb);
    onAccent(ACCENT_COLOR);

    document.querySelectorAll("a").forEach((item) => {
      item.style.color = `rgb(${accent_rgb.r},${accent_rgb.g},${accent_rgb.b})`;
    });
    document.querySelector("body")!.style.backgroundColor =
      `rgb(${bg_rgb.r},${bg_rgb.g},${bg_rgb.b})`;
  };
  image.src = startImage;
}

function get_avg_color(image: ImageData) {
  let i = -4;
  let blockSize = 5;

  let totalWeight = 0;
  let weightedR = 0,
    weightedG = 0,
    weightedB = 0;

  var bg_rgb = { r: 0, g: 0, b: 0 };
  let bestSaturation: number = 0;

  let length = image.data.length;

  while ((i += blockSize * 4) < length) {
    const r = image.data[i];
    const g = image.data[i + 1];
    const b = image.data[i + 2];
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
  const accent_rgb = {
    r: Math.floor(weightedR / totalWeight),
    g: Math.floor(weightedG / totalWeight),
    b: Math.floor(weightedB / totalWeight),
  };

  return { accent_rgb, bg_rgb };
}

function getSaturation(r: number, g: number, b: number) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  if (max === 0) return 0;
  return delta / max;
}

function resizeImage() {
  let width = canvas_image.clientWidth;
  let height = canvas_image.clientHeight;
  canvas_image.height = height;
  canvas_image.width = width;
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
  const hr = r.toString(16).padStart(2, "0");
  const hg = g.toString(16).padStart(2, "0");
  const hb = b.toString(16).padStart(2, "0");
  return `#${hr}${hg}${hb}`;
}

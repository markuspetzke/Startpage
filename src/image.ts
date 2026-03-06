import startImage from "../public/img/start.jpg";
let canvas_image: HTMLCanvasElement = document.getElementById(
  "canvas-image",
) as HTMLCanvasElement;

if (canvas_image) {
  console.log("canvas_image");
  let ctx_image = canvas_image.getContext("2d");
  let width = canvas_image.clientWidth;
  let height = canvas_image.clientHeight;
  canvas_image.height = height;
  canvas_image.width = width;

  if (ctx_image) {
    let image = new Image();

    image.onload = function () {
      ctx_image.drawImage(image, 0, 0, width, height);
      let { accent_rgb, bg_rgb } = get_avg_color(
        ctx_image.getImageData(0, 0, width, height),
      );

      let a = document.querySelectorAll("a");
      a.forEach((item) => {
        item.style.color = `rgb(${accent_rgb.r},${accent_rgb.g},${accent_rgb.b})`;
      });

      let body = document.querySelector("body") as HTMLBodyElement;
      body.style.backgroundColor = `rgb(${bg_rgb.r},${bg_rgb.g},${bg_rgb.b})`;
    };
    image.src = startImage;
  }
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

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
      get_avg_color(ctx_image.getImageData(0, 0, width, height));
    };
    image.src = startImage;
  }
}

function get_avg_color(image: ImageData) {
  let i = -4;
  let blockSize = 5;

  let count = 0;
  var rgb = { r: 0, g: 0, b: 0, a: 0 };
  let length = image.data.length;

  while ((i += blockSize * 4) < length) {
    const r = image.data[i];
    const g = image.data[i + 1];
    const b = image.data[i + 2];
    if (r < 30 || g < 30 || b < 30) continue;
    if (r > 225 && g > 225 && b > 225) continue;
    count++;
    rgb.r += r;
    rgb.g += g;
    rgb.b += b;
  }

  if (count === 0) return;
  rgb.r = Math.floor(rgb.r / count);
  rgb.g = Math.floor(rgb.g / count);
  rgb.b = Math.floor(rgb.b / count);
  let body = document.getElementById("body") as HTMLBodyElement;
  body.style.backgroundColor = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
}

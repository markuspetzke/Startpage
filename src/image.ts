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
  var rgb = { r: 0, g: 0, b: 0 };
  let length = image.data.length;

  while ((i += blockSize * 4) < length) {
    count++;
    rgb.r += image.data[i];
    rgb.g += image.data[i + 1];
    rgb.b += image.data[i + 2];
  }
  rgb.r = ~(rgb.r / count) * -1;
  rgb.g = ~(rgb.g / count) * -1;
  rgb.b = ~(rgb.b / count) * -1;

  console.log("r: " + rgb.r);
  console.log("g: " + rgb.g);
  console.log("b: " + rgb.b);

  let body = document.getElementById("body") as HTMLBodyElement;
  body.style =
    "background-color: RGB(" +
    rgb.r +
    "," +
    rgb.g +
    "," +
    rgb.b +
    "); display: flex";
}

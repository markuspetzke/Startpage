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
    };

    image.src = startImage;
  }
}

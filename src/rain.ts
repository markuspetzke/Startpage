const canvas: HTMLCanvasElement = document.getElementById(
  "canvas-rain",
) as HTMLCanvasElement;

const ctx = canvas.getContext("2d");

type COLUMN = string[];
type MATRIX = COLUMN[];
const CELL_SIZE = 32;

const matrix: MATRIX = [
  ["a", "b", "c"],
  ["1", "2", "3"],
];

if (ctx != null) {
  ctx.font = "32px mono ";
  ctx.fillStyle = "green";
  // ctx.fillText("0", 10, 30);
  render(matrix, ctx);
}

function render(matrix: MATRIX, ctx: CanvasRenderingContext2D) {
  let x = CELL_SIZE;
  for (const column of matrix) {
    let y = CELL_SIZE;
    for (const letter of column) {
      ctx.fillText(letter, x, y);
      y += CELL_SIZE;
    }
    x += CELL_SIZE;
  }
}

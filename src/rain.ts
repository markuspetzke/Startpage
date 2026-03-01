const canvas: HTMLCanvasElement = document.getElementById(
  "canvas-rain",
) as HTMLCanvasElement;

const ctx = canvas.getContext("2d");

type COLUMN = string[];
type MATRIX = COLUMN[];

const WIDTH = canvas.clientWidth;
const HEIGHT = canvas.clientHeight;
canvas.height = HEIGHT;
canvas.width = WIDTH;
const TEXT = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBER = "1234567890";
const ALPHABET = TEXT + NUMBER;
const CELL_SIZE = 32;

if (ctx != null) {
  ctx.font = CELL_SIZE + "px mono ";
  ctx.fillStyle = "green";

  render(ctx);
}

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function render(ctx: CanvasRenderingContext2D) {
  const row_count = Math.floor(HEIGHT / CELL_SIZE) * CELL_SIZE;
  const column_count = Math.floor(WIDTH / CELL_SIZE) * CELL_SIZE;

  for (let x = 0; x <= column_count; x += CELL_SIZE) {
    for (let y = CELL_SIZE; y <= row_count; y += CELL_SIZE) {
      const letter = ALPHABET.charAt(
        randomIntFromInterval(0, ALPHABET.length - 1),
      );
      ctx.fillText(letter, x, y);
    }
  }
}

import { getAccentColorFromImage } from "./image";
type Cell = {
  position: number;
  char: string;
  retainChar: number;
  activeFor: number;
  color: Color;
  retainColor: number;
};
type COLUMN = {
  cells: Cell[];
  head?: Cell;
  trail: number;
  ticksLeft: number;
  speed: number;
};

type MATRIX = COLUMN[];

type Shades = string[number];
type Color = typeof WHITE | Shades;

getAccentColorFromImage((accentHex) => {
  const accent_rgb = hexToRGB(accentHex);
  const SHADES = [
    adjustBrightness(accent_rgb, -30),
    adjustBrightness(accent_rgb, -15),
    accentHex,
    adjustBrightness(accent_rgb, 15),
    adjustBrightness(accent_rgb, 30),
  ];

  startRain(SHADES);
});

function hexToRGB(hex: string): [number, number, number] {
  const numericValue = parseInt(hex.replace("#", ""), 16);
  const r = (numericValue >> 16) & 0xff;
  const g = (numericValue >> 8) & 0xff;
  const b = numericValue & 0xff;
  return [r, g, b];
}

function adjustBrightness([r, g, b]: number[], percent: number): string {
  const newR = Math.min(
    255,
    Math.max(0, Math.floor(r + (percent / 100) * 255)),
  );
  const newG = Math.min(
    255,
    Math.max(0, Math.floor(g + (percent / 100) * 255)),
  );
  const newB = Math.min(
    255,
    Math.max(0, Math.floor(b + (percent / 100) * 255)),
  );
  return `rgb(${newR},${newG},${newB})`;
}

const WHITE = "#f0fdf4";
const TEXT = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBER = "1234567890";
const ALPHABET = TEXT + NUMBER;
const RAINDROP_SWPAN_RATE = 0.8;
const FRAME_RATE = 1000 / 15;

let width: number;
let height: number;

let CELL_SIZE = 32;

let row_count: number;
let column_count: number;
let matrix: MATRIX;
let ctx: any;
const canvas: HTMLCanvasElement = document.getElementById(
  "canvas-rain",
) as HTMLCanvasElement;

function startRain(SHADES: string[]) {
  if (canvas) {
    ctx = canvas.getContext("2d");
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.height = height;
    canvas.width = width;

    CELL_SIZE = Math.floor(width / 40);
    row_count = Math.floor(height / CELL_SIZE);
    column_count = Math.floor(width / CELL_SIZE);

    if (ctx) {
      ctx.font = CELL_SIZE + "px mono ";
      ctx.fillStyle = "green";

      window.addEventListener("resize", resizeCanvas);

      matrix = createMatrix();
      window.setInterval(() => {
        tick(matrix, SHADES);
        render(matrix, ctx);
      }, FRAME_RATE);
    }
  }
}

function createMatrix(): MATRIX {
  let matrix: MATRIX = [];

  for (let x = 0; x < column_count; x++) {
    let cells: Cell[] = [];
    for (let y = 0; y <= row_count; y++) {
      const cell: Cell = {
        position: y,
        char: "",
        retainChar: 0,
        activeFor: 0,
        color: WHITE,
        retainColor: 0,
      };
      cells.push(cell);
    }
    matrix.push({ cells, head: undefined, trail: 0, ticksLeft: 0, speed: 1 });
  }
  return matrix;
}

let tickNo = 0;
function tick(matrix: MATRIX, SHADES: string[]) {
  for (const column of matrix) {
    if (tickNo % column.speed !== 0) {
      continue;
    }
    const animationComplete = column.ticksLeft <= 0;
    if (animationComplete && Math.random() > RAINDROP_SWPAN_RATE) {
      column.speed = randomIntFromInterval(1, 6);
      column.trail = randomIntFromInterval(3, 2 * row_count);
      column.ticksLeft = row_count + column.trail;
      column.head = column.cells[0];
    } else {
      if (column.head) {
        const nextCell = column.cells[column.head!.position + 1];
        if (nextCell) {
          column.head = nextCell;
          nextCell.activeFor = column.trail;
        } else {
          column.head = undefined;
        }
      }
      column.ticksLeft -= 1;
    }
    for (const cell of column.cells) {
      if (cell.activeFor > 0) {
        if (column.head === cell) {
          cell.color = WHITE;
          cell.retainColor = 0;

          cell.char = randomChar();
          cell.retainChar = randomIntFromInterval(1, 10);
        } else {
          if (cell.retainColor <= 0) {
            cell.color = SHADES[randomIntFromInterval(0, SHADES.length - 1)];
            cell.retainColor = randomIntFromInterval(1, 10);
          } else {
            cell.retainColor -= 1;
          }

          if (cell.retainChar <= 0) {
            cell.char = randomChar();
            cell.retainChar = randomIntFromInterval(1, 10);
          } else {
            cell.retainChar -= 1;
          }
        }
        cell.activeFor -= 1;
      } else {
        cell.char = "";
      }
    }
  }
  tickNo += 1;
}

function randomChar() {
  return ALPHABET.charAt(randomIntFromInterval(0, ALPHABET.length - 1));
}
function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function render(matrix: MATRIX, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(0, 0, width, height);
  let x = 0;
  for (const column of matrix) {
    let y = 0;
    for (const cell of column.cells) {
      ctx.fillStyle = cell.color;
      ctx.fillText(cell.char, x, y);
      y += CELL_SIZE;
    }
    x += CELL_SIZE;
  }
}

function resizeCanvas() {
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = width;
  canvas.height = height;

  CELL_SIZE = Math.floor(width / 40);
  row_count = Math.floor(height / CELL_SIZE);
  column_count = Math.floor(width / CELL_SIZE);

  ctx!.font = CELL_SIZE + "px mono ";
  matrix = createMatrix();
}

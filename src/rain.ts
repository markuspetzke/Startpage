const canvas: HTMLCanvasElement = document.getElementById(
  "canvas-rain",
) as HTMLCanvasElement;

const ctx = canvas.getContext("2d");

type Cell = {
  position: number;
  char: string;
  activeFor: number;
  color: Color;
};
type COLUMN = {
  cells: Cell[];
  head?: Cell;
  trail: number;
};

type MATRIX = COLUMN[];

const GREENS = ["#15803d", "#16a34a", "#22c55e", "#4ade80"] as const;
const WHITE = "#f0fdf4";

type Greens = (typeof GREENS)[number];

type Color = typeof WHITE | Greens;

const WIDTH = canvas.clientWidth;
const HEIGHT = canvas.clientHeight;
const RAINDROP_SWPAN_RATE = 0.8;
canvas.height = HEIGHT;
canvas.width = WIDTH;
const TEXT = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBER = "1234567890";
const ALPHABET = TEXT + NUMBER;
const CELL_SIZE = 32;

const ROW_COUNT = Math.floor(HEIGHT / CELL_SIZE);
const COLUMN_COUNT = Math.floor(WIDTH / CELL_SIZE);

if (ctx) {
  ctx.font = CELL_SIZE + "px mono ";
  ctx.fillStyle = "green";

  let matrix = createMatrix();
  window.setInterval(() => {
    tick(matrix);
    render(matrix, ctx);
  }, 1000);
}

function createMatrix(): MATRIX {
  let matrix: MATRIX = [];

  const row_count = Math.floor(HEIGHT / CELL_SIZE);
  const column_count = Math.floor(WIDTH / CELL_SIZE);

  for (let x = 0; x < column_count; x++) {
    let cells: Cell[] = [];
    for (let y = 0; y <= row_count; y++) {
      const cell: Cell = {
        position: y,
        char: randomChar(),
        activeFor: 0,
        color: WHITE,
      };
      cells.push(cell);
    }
    matrix.push({ cells, head: undefined, trail: 0 });
  }
  return matrix;
}

function tick(matrix: MATRIX) {
  for (const column of matrix) {
    const animationComplete = column.head === undefined;
    if (animationComplete && Math.random() > RAINDROP_SWPAN_RATE) {
      column.trail = randomIntFromInterval(3, 2 * ROW_COUNT);
      column.head = column.cells[0];
      column.head.char = randomChar();
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
    }
    for (const cell of column.cells) {
      if (cell.activeFor > 0) {
        if (column.head === cell) {
          cell.color = WHITE;
        } else {
          cell.color = GREENS[randomIntFromInterval(0, GREENS.length - 1)];
        }
        cell.char = randomChar();
        cell.activeFor -= 1;
      } else {
        cell.char = "";
      }
    }
  }
}

function randomChar() {
  return ALPHABET.charAt(randomIntFromInterval(0, ALPHABET.length - 1));
}
function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function render(matrix: MATRIX, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
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

import { toCss, type RGB } from "./image";

type Cell = {
  position: number;
  char: string;
  retainChar: number;
  activeFor: number;
  color: string;
  retainColor: number;
};

type Column = {
  cells: Cell[];
  head?: Cell;
  trail: number;
  ticksLeft: number;
  speed: number;
};

type Matrix = Column[];

const WHITE = "#f0fdf4";
const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
const SPAWN_CHANCE = 0.2;
const FRAME_INTERVAL = 1000 / 15;
const COLUMNS = 40;

const STATIC_TICKS = 60;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let width = 0;
let height = 0;
let cellSize = 0;
let rowCount = 0;
let columnCount = 0;
let matrix: Matrix = [];
let tickNo = 0;

export function startRain(canvas: HTMLCanvasElement, accent: RGB) {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  const shades = [-30, -15, 0, 15, 30].map((percent) =>
    toCss(adjustBrightness(accent, percent)),
  );

  const setup = () => {
    setupCanvas(canvas, ctx);
    // Bei reduzierter Bewegung nur ein stehendes Bild zeichnen
    if (reducedMotion.matches) {
      for (let i = 0; i < STATIC_TICKS; i++) tick(shades);
      render(ctx);
    }
  };
  setup();

  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(setup);
  });

  // requestAnimationFrame pausiert automatisch in Hintergrund-Tabs
  let lastFrame = 0;
  const loop = (now: number) => {
    if (!reducedMotion.matches && now - lastFrame >= FRAME_INTERVAL) {
      lastFrame = now;
      tick(shades);
      render(ctx);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

function adjustBrightness({ r, g, b }: RGB, percent: number): RGB {
  const offset = (percent / 100) * 255;
  const adjust = (value: number) =>
    Math.min(255, Math.max(0, Math.floor(value + offset)));
  return { r: adjust(r), g: adjust(g), b: adjust(b) };
}

function setupCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const dpr = window.devicePixelRatio || 1;
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  cellSize = Math.max(1, Math.floor(width / COLUMNS));
  rowCount = Math.floor(height / cellSize);
  columnCount = Math.floor(width / cellSize);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.font = `${cellSize}px monospace`;
  ctx.textBaseline = "top";
  matrix = createMatrix();
}

function createMatrix(): Matrix {
  return Array.from({ length: columnCount }, () => ({
    cells: Array.from({ length: rowCount }, (_, position) => ({
      position,
      char: "",
      retainChar: 0,
      activeFor: 0,
      color: WHITE,
      retainColor: 0,
    })),
    head: undefined,
    trail: 0,
    ticksLeft: 0,
    speed: 1,
  }));
}

function tick(shades: string[]) {
  for (const column of matrix) {
    if (tickNo % column.speed !== 0) continue;

    if (column.ticksLeft <= 0 && Math.random() < SPAWN_CHANCE) {
      column.speed = randomInt(1, 6);
      column.trail = randomInt(3, 2 * rowCount);
      column.ticksLeft = rowCount + column.trail;
      column.head = column.cells[0];
      if (column.head) column.head.activeFor = column.trail;
    } else {
      if (column.head) {
        const nextCell = column.cells[column.head.position + 1];
        column.head = nextCell;
        if (nextCell) nextCell.activeFor = column.trail;
      }
      column.ticksLeft -= 1;
    }

    for (const cell of column.cells) {
      if (cell.activeFor <= 0) {
        cell.char = "";
        continue;
      }

      if (column.head === cell) {
        cell.color = WHITE;
        cell.retainColor = 0;
        cell.char = randomChar();
        cell.retainChar = randomInt(1, 10);
      } else {
        if (cell.retainColor <= 0) {
          cell.color = shades[randomInt(0, shades.length - 1)];
          cell.retainColor = randomInt(1, 10);
        } else {
          cell.retainColor -= 1;
        }

        if (cell.retainChar <= 0) {
          cell.char = randomChar();
          cell.retainChar = randomInt(1, 10);
        } else {
          cell.retainChar -= 1;
        }
      }
      cell.activeFor -= 1;
    }
  }
  tickNo += 1;
}

function render(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  matrix.forEach((column, x) => {
    for (const cell of column.cells) {
      if (!cell.char) continue;
      ctx.fillStyle = cell.color;
      ctx.fillText(cell.char, x * cellSize, cell.position * cellSize);
    }
  });
}

function randomChar() {
  return ALPHABET.charAt(randomInt(0, ALPHABET.length - 1));
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const canvas: HTMLCanvasElement = document.getElementById(
  "canvas-rain",
) as HTMLCanvasElement;

const ctx = canvas.getContext("2d");

type Cell = {
  position: number;
  char: string;
};
type COLUMN = {
  cells: Cell[];
  head: Cell;
};
type MATRIX = COLUMN[];

const WIDTH = canvas.clientWidth;
const HEIGHT = canvas.clientHeight;
canvas.height = HEIGHT;
canvas.width = WIDTH;
const TEXT = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBER = "1234567890";
const ALPHABET = TEXT + NUMBER;
const CELL_SIZE = 32;

if (ctx) {
  ctx.font = CELL_SIZE + "px mono ";
  ctx.fillStyle = "green";

  let matrix = createMatrix();
  window.setInterval(() => {
    console.log("tick");

    tick(matrix);
    render(matrix, ctx);
  }, 1000);
}

function createMatrix(): MATRIX {
  let matrix: MATRIX = [];

  const row_count = Math.floor(HEIGHT / CELL_SIZE);
  const column_count = Math.floor(WIDTH / CELL_SIZE);

  for (let x = 0; x <= column_count; x += 1) {
    let cells: Cell[] = [];
    for (let y = 0; y <= row_count; y += 1) {
      const letter = ALPHABET.charAt(
        randomIntFromInterval(0, ALPHABET.length - 1),
      );

      const cell: Cell = {
        position: y,
        char: letter,
      };
      cells.push(cell);
    }
    matrix.push({ cells, head: cells[0] });
  }
  return matrix;
}

function tick(matrix: MATRIX) {
  for (const column of matrix) {
    const nextCell = column.cells[column.head.position + 1];

    console.log(column.head.position + 1);

    if (nextCell) {
      column.head.char = "";
      nextCell.char = ALPHABET.charAt(
        randomIntFromInterval(0, ALPHABET.length - 1),
      );
      column.head = nextCell;
    } else {
      column.head.char = "";
      column.head = column.cells[0];
    }
  }
}

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function render(matrix: MATRIX, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "rgb(0,16,0)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "green";
  let x = 0;
  for (const column of matrix) {
    let y = CELL_SIZE;
    for (const cell of column.cells) {
      ctx.fillText(cell.char, x, y);
      y += CELL_SIZE;
    }

    x += CELL_SIZE;
  }
}

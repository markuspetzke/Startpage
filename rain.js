(() => {
  // public/img/start.jpg
  var start_default = "./start-vqpv6c77.jpg";

  // src/image.ts
  var ACCENT_COLOR = "#15803d";
  var canvas_image = document.getElementById("canvas-image");
  var image = new Image;
  function getAccentColorFromImage(onAccent) {
    if (!canvas_image)
      return;
    const ctx = canvas_image.getContext("2d");
    const width = canvas_image.clientWidth;
    const height = canvas_image.clientHeight;
    canvas_image.width = width;
    canvas_image.height = height;
    if (!ctx)
      return;
    image.onload = () => {
      window.addEventListener("resize", resizeImage);
      ctx.drawImage(image, 0, 0, width, height);
      const { accent_rgb, bg_rgb } = get_avg_color(start_default);
      ACCENT_COLOR = rgbToHex(accent_rgb);
      onAccent(ACCENT_COLOR);
      document.querySelectorAll("a").forEach((item) => {
        item.style.color = `rgb(${accent_rgb.r},${accent_rgb.g},${accent_rgb.b})`;
      });
      document.querySelector("body").style.backgroundColor = `rgb(${bg_rgb.r},${bg_rgb.g},${bg_rgb.b})`;
    };
    image.src = start_default;
  }
  function get_avg_color(image2) {
    let i = -4;
    let blockSize = 5;
    let totalWeight = 0;
    let weightedR = 0, weightedG = 0, weightedB = 0;
    var bg_rgb = { r: 0, g: 0, b: 0 };
    let bestSaturation = 0;
    let length = image2.data.length;
    while ((i += blockSize * 4) < length) {
      const r = image2.data[i];
      const g = image2.data[i + 1];
      const b = image2.data[i + 2];
      if (r < 30 && g < 30 && b < 30)
        continue;
      if (r > 225 && g > 225 && b > 225)
        continue;
      const weight = getSaturation(r, g, b);
      if (weight < 0.1)
        continue;
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
      b: Math.floor(weightedB / totalWeight)
    };
    return { accent_rgb, bg_rgb };
  }
  function getSaturation(r, g, b) {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const delta = max - min;
    if (max === 0)
      return 0;
    return delta / max;
  }
  function resizeImage() {
    let width = canvas_image.clientWidth;
    let height = canvas_image.clientHeight;
    canvas_image.height = height;
    canvas_image.width = width;
    console.log("test");
    canvas_image.getContext("2d")?.drawImage(image, 0, 0, width, height);
  }
  function rgbToHex({ r, g, b }) {
    const hr = r.toString(16).padStart(2, "0");
    const hg = g.toString(16).padStart(2, "0");
    const hb = b.toString(16).padStart(2, "0");
    return `#${hr}${hg}${hb}`;
  }

  // src/rain.ts
  getAccentColorFromImage((accentHex) => {
    const accent_rgb = hexToRGB(accentHex);
    const SHADES = [
      adjustBrightness(accent_rgb, -30),
      adjustBrightness(accent_rgb, -15),
      accentHex,
      adjustBrightness(accent_rgb, 15),
      adjustBrightness(accent_rgb, 30)
    ];
    startRain(SHADES);
  });
  function hexToRGB(hex) {
    const numericValue = parseInt(hex.replace("#", ""), 16);
    const r = numericValue >> 16 & 255;
    const g = numericValue >> 8 & 255;
    const b = numericValue & 255;
    return [r, g, b];
  }
  function adjustBrightness([r, g, b], percent) {
    const newR = Math.min(255, Math.max(0, Math.floor(r + percent / 100 * 255)));
    const newG = Math.min(255, Math.max(0, Math.floor(g + percent / 100 * 255)));
    const newB = Math.min(255, Math.max(0, Math.floor(b + percent / 100 * 255)));
    return `rgb(${newR},${newG},${newB})`;
  }
  var WHITE = "#f0fdf4";
  var TEXT = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var NUMBER = "1234567890";
  var ALPHABET = TEXT + NUMBER;
  var RAINDROP_SWPAN_RATE = 0.8;
  var FRAME_RATE = 1000 / 15;
  var width;
  var height;
  var CELL_SIZE = 32;
  var row_count;
  var column_count;
  var matrix;
  var ctx;
  var canvas = document.getElementById("canvas-rain");
  function startRain(SHADES) {
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
  function createMatrix() {
    let matrix2 = [];
    for (let x = 0;x < column_count; x++) {
      let cells = [];
      for (let y = 0;y <= row_count; y++) {
        const cell = {
          position: y,
          char: "",
          retainChar: 0,
          activeFor: 0,
          color: WHITE,
          retainColor: 0
        };
        cells.push(cell);
      }
      matrix2.push({ cells, head: undefined, trail: 0, ticksLeft: 0, speed: 1 });
    }
    return matrix2;
  }
  var tickNo = 0;
  function tick(matrix2, SHADES) {
    for (const column of matrix2) {
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
          const nextCell = column.cells[column.head.position + 1];
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
  function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  function render(matrix2, ctx2) {
    ctx2.fillStyle = "rgb(0,0,0)";
    ctx2.fillRect(0, 0, width, height);
    let x = 0;
    for (const column of matrix2) {
      let y = 0;
      for (const cell of column.cells) {
        ctx2.fillStyle = cell.color;
        ctx2.fillText(cell.char, x, y);
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
    ctx.font = CELL_SIZE + "px mono ";
    matrix = createMatrix();
  }
})();

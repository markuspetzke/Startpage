import { loadRandomImage } from "./image";
import { startRain } from "./rain";

const img = document.getElementById("start-image") as HTMLImageElement;
const canvas = document.getElementById("canvas-rain") as HTMLCanvasElement;

const accent = await loadRandomImage(img);
startRain(canvas, accent);

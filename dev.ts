import { watch } from "node:fs";
import { resolve } from "node:path";
import { build } from "./build";

const OUT_DIR = resolve(import.meta.dir, "dist");
const WATCHED = ["src", "public", "index.html"];

// Baut bei Änderungen neu und liefert dist/ statisch aus (wie GitHub Pages)
async function rebuild() {
  try {
    await build();
    console.log(`Gebaut um ${new Date().toLocaleTimeString()}`);
  } catch (error) {
    console.error(error);
  }
}

await rebuild();

let timer: Timer | undefined;
for (const path of WATCHED) {
  watch(resolve(import.meta.dir, path), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 100);
  });
}

const server = Bun.serve({
  async fetch(req) {
    let path = new URL(req.url).pathname;
    if (path.endsWith("/")) path += "index.html";
    const file = Bun.file(OUT_DIR + path);
    return (await file.exists())
      ? new Response(file)
      : new Response("Not found", { status: 404 });
  },
});

console.log(`Startpage: ${server.url}`);

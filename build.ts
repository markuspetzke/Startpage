import { readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import type { BunPlugin } from "bun";

const IMG_DIR = resolve(import.meta.dir, "public/img");
const OUT_DIR = resolve(import.meta.dir, "dist");
const IMAGE_FILE = /\.(avif|webp|jpe?g|png|gif)$/i;

// Stellt alle Bilder aus public/img als `import images from "virtual:images"` bereit
const imagesPlugin: BunPlugin = {
  name: "images",
  setup(build) {
    build.onResolve({ filter: /^virtual:images$/ }, ({ path }) => ({
      path,
      namespace: "images",
    }));

    build.onLoad({ filter: /.*/, namespace: "images" }, async () => {
      const files = (await readdir(IMG_DIR)).filter((f) => IMAGE_FILE.test(f));
      const imports = files.map(
        (f, i) => `import img${i} from ${JSON.stringify(resolve(IMG_DIR, f))};`,
      );
      const list = files.map((_, i) => `img${i}`).join(", ");
      return {
        contents: `${imports.join("\n")}\nexport default [${list}];`,
        loader: "js",
      };
    });
  },
};

export async function build() {
  await rm(OUT_DIR, { recursive: true, force: true });
  const result = await Bun.build({
    entrypoints: [resolve(import.meta.dir, "index.html")],
    outdir: OUT_DIR,
    minify: true,
    plugins: [imagesPlugin],
  });
  if (!result.success) {
    for (const log of result.logs) console.error(log);
    throw new Error("Build fehlgeschlagen");
  }
  return result;
}

if (import.meta.main) {
  const result = await build();
  for (const output of result.outputs) console.log(output.path);
}

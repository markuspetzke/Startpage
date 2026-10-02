// Baut rain.js bei Änderungen neu und liefert den Ordner statisch aus (wie GitHub Pages)
Bun.spawn(["bun", "run", "build", "--watch"], {
  stdout: "inherit",
  stderr: "inherit",
});

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    let path = new URL(req.url).pathname;
    if (path.endsWith("/")) path += "index.html";
    const file = Bun.file("." + path);
    return (await file.exists())
      ? new Response(file)
      : new Response("Not found", { status: 404 });
  },
});

console.log(`Startpage: ${server.url}`);

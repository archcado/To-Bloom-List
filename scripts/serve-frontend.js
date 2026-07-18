import http from "node:http";
import { createReadStream, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(scriptDirectory, "../frontend");
const port = Number(process.env.FRONTEND_PORT || 5500);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
};

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host}`);
  const pathname = decodeURIComponent(requestUrl.pathname);
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(frontendRoot, `.${requestedPath}`);

  if (!filePath.startsWith(`${frontendRoot}${path.sep}`)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    if (!statSync(filePath).isFile()) {
      throw new Error("Not a file");
    }
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not Found");
  }
});

server.listen(port, () => {
  console.log(`To Bloom List frontend: http://localhost:${port}`);
});


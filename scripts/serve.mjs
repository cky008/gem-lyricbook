import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requestedRoot = process.argv[2] || '.';
const root = path.resolve(repoRoot, requestedRoot);
const port = Number(process.argv[3] || process.env.PORT || 5173);
const mime = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'], ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'], ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.md', 'text/markdown; charset=utf-8'],
]);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const filename = path.resolve(root, `.${pathname}`);
    if (!filename.startsWith(root)) throw new Error('Forbidden');
    const data = await fs.readFile(filename);
    response.writeHead(200, {
      'Content-Type': mime.get(path.extname(filename).toLowerCase()) || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(data);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('404 Not Found');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}`);
});

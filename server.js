import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import leetcode from './api/leetcode.js';

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)));
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' };
const port = Number(process.env.PORT || 3000);
http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/api/leetcode') {
      await leetcode(request, response);
      return;
    }
    if (!['/', '/index.html', '/styles.css', '/app.js', '/assets/banner.svg', '/assets/banner.jpg', '/assets/profile.jpg'].includes(pathname)) {
      response.writeHead(404).end('Not found');
      return;
    }
    const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(root + path.sep)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': `${types[path.extname(file)] || 'application/octet-stream'}; charset=utf-8` });
    response.end(content);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(port, '0.0.0.0', () => console.log(`Portfolio listening on port ${port}`));

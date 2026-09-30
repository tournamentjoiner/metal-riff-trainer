// Minimal zero-dependency static server.
//   npm start        serves public/, with /vendor/alphatab/* from node_modules
//   npm run preview  serves the built dist/ folder only, exactly as a web host would
import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT, 'public');
const ALPHATAB_DIR = path.join(ROOT, 'node_modules', '@coderline', 'alphatab', 'dist');
const VENDOR_PREFIX = '/vendor/alphatab/';

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.otf': 'font/otf',
    '.eot': 'application/vnd.ms-fontobject',
    '.sf2': 'application/octet-stream',
    '.sf3': 'application/octet-stream',
    '.alphatex': 'text/plain; charset=utf-8',
    '.webmanifest': 'application/manifest+json',
};

function resolvePath(urlPath, root) {
    let base = root;
    let rel = urlPath;
    // In development alphaTab comes straight from node_modules; a built folder has its own copy.
    if (root === PUBLIC_DIR && urlPath.startsWith(VENDOR_PREFIX)) {
        base = ALPHATAB_DIR;
        rel = urlPath.slice(VENDOR_PREFIX.length);
    }
    if (rel.endsWith('/') || rel === '') rel += 'index.html';
    const full = path.normalize(path.join(base, rel));
    // Block path traversal outside the served directory.
    if (full !== base && !full.startsWith(base + path.sep)) return null;
    return full;
}

/** @param root folder to serve (defaults to public/ for development) */
export function createServer({ root = PUBLIC_DIR } = {}) {
    // Normalise so the traversal check compares like with like (e.g. "C:/x" vs "C:\x").
    root = path.resolve(root);
    return http.createServer(async (req, res) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            res.writeHead(405).end();
            return;
        }
        let urlPath;
        try {
            urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
        } catch {
            res.writeHead(400).end('Bad request');
            return;
        }
        const file = resolvePath(urlPath, root);
        if (!file) {
            res.writeHead(403).end('Forbidden');
            return;
        }
        try {
            const info = await stat(file);
            if (!info.isFile()) throw new Error('not a file');
            res.writeHead(200, {
                'Content-Type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
                'Content-Length': info.size,
                'Cache-Control': 'no-cache',
            });
            if (req.method === 'HEAD') {
                res.end();
                return;
            }
            createReadStream(file).pipe(res);
        } catch {
            res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
        }
    });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    // `node server.js dist` previews the built site; with no argument, serve public/.
    const dir = process.argv[2];
    const root = dir ? path.resolve(ROOT, dir) : PUBLIC_DIR;
    const port = Number(process.env.PORT) || (dir ? 5174 : 5173);
    createServer({ root }).listen(port, () => {
        console.log(`Metal Riff Trainer running at http://localhost:${port}${dir ? ` (serving ${dir}/)` : ''}`);
    });
}

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { build, normalizeSiteUrl } from '../scripts/build.mjs';
import { createServer } from '../server.js';

let outDir;
let result;

before(async () => {
    outDir = path.join(await mkdtemp(path.join(tmpdir(), 'mrt-build-')), 'dist');
    result = await build({ outDir, siteUrl: 'https://example.github.io/metal-riff-trainer' });
});

after(() => rm(path.dirname(outDir), { recursive: true, force: true }));

test('normalizeSiteUrl adds a trailing slash and rejects non-web URLs', () => {
    assert.equal(normalizeSiteUrl('https://x.io/app'), 'https://x.io/app/');
    assert.equal(normalizeSiteUrl('https://x.io/app/?q=1#h'), 'https://x.io/app/');
    assert.equal(normalizeSiteUrl(null), null);
    assert.throws(() => normalizeSiteUrl('ftp://x.io/'), /https/);
    assert.throws(() => normalizeSiteUrl('not a url'));
});

test('build contains the app, drills, images and every alphaTab runtime file', async () => {
    for (const rel of [
        'index.html', 'manifest.webmanifest', 'css/styles.css', 'js/app.js', 'js/vendor.js',
        'drills/dm-death-metal-gauntlet.alphatex', 'img/og-image.png', 'img/icon-512.png', 'img/apple-touch-icon.png',
        'vendor/alphatab/alphaTab.js', 'vendor/alphatab/alphaTab.core.mjs', 'vendor/alphatab/alphaTab.worker.mjs',
        'vendor/alphatab/alphaTab.worklet.mjs', 'vendor/alphatab/font/Bravura.woff2',
        'vendor/alphatab/soundfont/sonivox.sf2', 'vendor/alphatab/soundfont/LICENSE', 'vendor/alphatab/LICENSE',
    ]) {
        assert.ok((await stat(path.join(outDir, rel))).isFile(), `missing ${rel}`);
    }
    assert.ok(result.bytes < 20e6, `build is ${(result.bytes / 1e6).toFixed(1)} MB`);
});

test('link previews point at the full site address', async () => {
    const html = await readFile(path.join(outDir, 'index.html'), 'utf8');
    assert.ok(!html.includes('__SITE_URL__'));
    assert.match(html, /property="og:url" content="https:\/\/example\.github\.io\/metal-riff-trainer\/"/);
    assert.match(html, /property="og:image" content="https:\/\/example\.github\.io\/metal-riff-trainer\/img\/og-image\.png"/);
    assert.deepEqual(result.warnings, []);
});

test('the built folder serves on its own (no node_modules fallback)', async () => {
    const server = createServer({ root: outDir });
    await new Promise(r => server.listen(0, r));
    const base = `http://localhost:${server.address().port}`;
    try {
        for (const p of ['/', '/vendor/alphatab/alphaTab.js', '/vendor/alphatab/soundfont/sonivox.sf2', '/manifest.webmanifest']) {
            const res = await fetch(base + p, { method: 'HEAD' });
            assert.equal(res.status, 200, p);
        }
        const manifest = await fetch(`${base}/manifest.webmanifest`);
        assert.match(manifest.headers.get('content-type'), /manifest\+json/);
        // Dev-only files must not leak into the site.
        assert.equal((await fetch(`${base}/vendor/alphatab/alphaTab.d.ts`, { method: 'HEAD' })).status, 404);
    } finally {
        server.close();
    }
});

test('the server accepts a folder written with forward slashes', async () => {
    const server = createServer({ root: outDir.replaceAll('\\', '/') });
    await new Promise(r => server.listen(0, r));
    try {
        const res = await fetch(`http://localhost:${server.address().port}/`, { method: 'HEAD' });
        assert.equal(res.status, 200);
    } finally {
        server.close();
    }
});

test('building without a site URL still works but warns', async () => {
    const dir = path.join(path.dirname(outDir), 'dist-nourl');
    const r = await build({ outDir: dir });
    const html = await readFile(path.join(dir, 'index.html'), 'utf8');
    assert.match(html, /property="og:image" content="img\/og-image\.png"/);
    assert.match(r.warnings[0], /site-url/);
});

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createServer } from '../server.js';

let server;
let base;

before(async () => {
    server = createServer();
    await new Promise(resolve => server.listen(0, resolve));
    base = `http://localhost:${server.address().port}`;
});

after(() => server.close());

test('serves the app page', async () => {
    const res = await fetch(`${base}/`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/html/);
    assert.match(await res.text(), /Metal Riff Trainer/);
});

test('serves alphaTab, its font and soundfont from node_modules', async () => {
    for (const p of ['alphaTab.js', 'font/Bravura.woff2', 'soundfont/sonivox.sf2']) {
        const res = await fetch(`${base}/vendor/alphatab/${p}`, { method: 'HEAD' });
        assert.equal(res.status, 200, p);
    }
});

test('serves drill files', async () => {
    const res = await fetch(`${base}/drills/gallop-drill.alphatex`);
    assert.equal(res.status, 200);
    assert.match(await res.text(), /\\title "Gallop Drill"/);
});

test('returns 404 for missing files', async () => {
    const res = await fetch(`${base}/nope.js`);
    assert.equal(res.status, 404);
});

test('blocks path traversal', async () => {
    // fetch() normalises "..", so send the raw path with http.get.
    const status = await new Promise((resolve, reject) => {
        http.get(`${base}/..%2Fpackage.json`, res => resolve(res.statusCode)).on('error', reject);
    });
    assert.equal(status, 403);
});

// Builds a folder of plain static files (dist/) that any web host can serve.
//   npm run build -- --site-url https://yourname.github.io/metal-riff-trainer/
// The site URL is used for link previews (Facebook needs a full image address).
import { cp, mkdir, readFile, rm, stat, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ALPHATAB = path.join(ROOT, 'node_modules', '@coderline', 'alphatab');

// Only what the app loads at run time (the rest of alphaTab's package is dev tooling).
const VENDOR_FILES = [
    'dist/alphaTab.js',
    'dist/alphaTab.core.mjs',
    'dist/alphaTab.worker.mjs',
    'dist/alphaTab.worklet.mjs',
    'dist/font',
    'dist/soundfont/sonivox.sf2',
    'dist/soundfont/LICENSE',
    'LICENSE',
];

/** "https://x.io/app" -> "https://x.io/app/"; rejects anything that isn't an http(s) URL. */
export function normalizeSiteUrl(siteUrl) {
    if (!siteUrl) return null;
    const url = new URL(siteUrl);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error(`Site URL must start with https:// (got ${siteUrl})`);
    url.search = '';
    url.hash = '';
    if (!url.pathname.endsWith('/')) url.pathname += '/';
    return url.href;
}

async function folderSize(dir) {
    let bytes = 0;
    let files = 0;
    for (const entry of await readdir(dir, { withFileTypes: true, recursive: true })) {
        if (!entry.isFile()) continue;
        files++;
        bytes += (await stat(path.join(entry.parentPath ?? entry.path, entry.name))).size;
    }
    return { files, bytes };
}

export async function build({ outDir = path.join(ROOT, 'dist'), siteUrl = null } = {}) {
    const site = normalizeSiteUrl(siteUrl);
    await rm(outDir, { recursive: true, force: true });
    await cp(path.join(ROOT, 'public'), outDir, { recursive: true });

    const vendorDir = path.join(outDir, 'vendor', 'alphatab');
    for (const rel of VENDOR_FILES) {
        const target = path.join(vendorDir, rel.replace(/^dist\//, ''));
        await mkdir(path.dirname(target), { recursive: true });
        await cp(path.join(ALPHATAB, rel), target, { recursive: true });
    }

    // Link previews: fill in the site address, or fall back to relative paths with a warning.
    const indexPath = path.join(outDir, 'index.html');
    const html = await readFile(indexPath, 'utf8');
    await writeFile(indexPath, html.replaceAll('__SITE_URL__', site ?? ''));

    const warnings = [];
    if (!site) {
        warnings.push('No --site-url given: the app works, but Facebook/text link previews need the full web address. Rebuild with --site-url once you know it.');
    }
    return { outDir, site, warnings, ...(await folderSize(outDir)) };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    const i = process.argv.indexOf('--site-url');
    const siteUrl = i > 0 ? process.argv[i + 1] : process.env.SITE_URL;
    const result = await build({ siteUrl });
    console.log(`Built ${result.files} files (${(result.bytes / 1e6).toFixed(1)} MB) into ${path.relative(ROOT, result.outDir)}/`);
    console.log(result.site ? `Link previews point at ${result.site}` : '');
    for (const w of result.warnings) console.warn(`Warning: ${w}`);
}

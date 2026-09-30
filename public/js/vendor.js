// Where alphaTab's font and sound library live, relative to the page, so the app
// works at any address (including a sub-folder such as user.github.io/metal-riff-trainer/).
const base = new URL('vendor/alphatab/', document.baseURI).href;

export const VENDOR = {
    font: `${base}font/`,
    soundFont: `${base}soundfont/sonivox.sf2`,
};

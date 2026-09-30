// Generates a metal drum track (as alphaTex) to play along with a drill.
// Pure functions: unit-tested in Node. Patterns are standard genre grooves.

const K = 'Kick (hit)';
const S = 'Snare (hit)';
const HH = 'Hi-Hat (closed)';
const OH = 'Hi-Hat (open)';
const RIDE = 'Ride (middle)';
const CRASH = 'Crash medium (hit)';
const CHINA = 'China (hit)';

const SIXTEENTH = 240; // ticks (quarter note = 960)
const TRIPLET_EIGHTH = 320;

export const DRUM_STYLES = {
    rock: 'Rock beat',
    'double-kick': 'Double kick',
    blast: 'Blast beat',
    dbeat: 'D-beat',
    follow: 'Kick follows the riff (half-time)',
    shuffle: 'Shuffle',
};

/** Bar lengths and guitar note positions from a parsed alphaTab score. */
export function barsFromScore(score, trackIndex = 0) {
    const staffBars = score.tracks[trackIndex].staves[0].bars;
    return score.masterBars.map((mb, i) => ({
        ticks: mb.calculateDuration(),
        onsets: (staffBars[i]?.voices[0]?.beats ?? [])
            .filter(b => !b.isRest && b.notes.length)
            .map(b => b.playbackStart),
    }));
}

/* ---------- patterns: each returns an array of Sets (one per grid slot) ---------- */

function grid(n) {
    return Array.from({ length: n }, () => new Set());
}

const PATTERNS = {
    rock(n) {
        const g = grid(n);
        g.forEach((slot, i) => {
            if (i % 2 === 0) slot.add(HH);
            if (i % 16 === 0 || i % 16 === 8 || i % 16 === 10) slot.add(K);
            if (i % 8 === 4) slot.add(S);
        });
        return g;
    },
    'double-kick'(n) {
        const g = grid(n);
        g.forEach((slot, i) => {
            slot.add(K);
            if (i % 4 === 0) slot.add(CHINA);
            if (i % 8 === 4) slot.add(S);
        });
        return g;
    },
    blast(n) {
        const g = grid(n);
        g.forEach((slot, i) => {
            if (i % 2 === 0) {
                slot.add(K);
                slot.add(RIDE);
            } else {
                slot.add(S);
            }
        });
        return g;
    },
    dbeat(n) {
        // Per bar of eighths: kick, -, snare, kick, kick, -, snare, - ; open hat on every eighth.
        const shape = [[K], [], [S], [K], [K], [], [S], []];
        const g = grid(n);
        g.forEach((slot, i) => {
            if (i % 2) return;
            slot.add(OH);
            for (const d of shape[(i / 2) % 8]) slot.add(d);
        });
        return g;
    },
    follow(n, onsetSlots) {
        const g = grid(n);
        const snareAt = n >= 12 ? 8 : Math.floor(n / 2);
        g.forEach((slot, i) => {
            if (i % 4 === 0) slot.add(CHINA);
            if (i === snareAt) slot.add(S);
        });
        for (const s of onsetSlots) if (s >= 0 && s < n) g[s].add(K);
        return g;
    },
};

function shuffleBar(n) {
    // Eighth-note-triplet grid: swung hi-hat on slots 0 and 2 of each beat.
    const g = grid(n);
    g.forEach((slot, i) => {
        const beat = Math.floor(i / 3);
        const pos = i % 3;
        if (pos === 0) {
            slot.add(HH);
            slot.add(beat % 2 === 0 ? K : S);
        } else if (pos === 2) {
            slot.add(HH);
        }
    });
    return g;
}

/* ---------- alphaTex output ---------- */

const quote = name => `"${name}"`;
function chord(set) {
    const names = [...set];
    return names.length === 1 ? quote(names[0]) : `(${names.map(quote).join(' ')})`;
}

// Grid slots (16ths) -> alphaTex duration values.
const DURATIONS = [[16, 1], [8, 2], [4, 4], [2, 8], [1, 16]];

function splitSlots(length) {
    const out = [];
    let left = length;
    while (left > 0) {
        const [slots, value] = DURATIONS.find(([s]) => s <= left);
        out.push(value);
        left -= slots;
    }
    return out;
}

/** One bar on the 16th grid: each hit lasts until the next hit; gaps become rests. */
function sixteenthBarTex(g) {
    const parts = [];
    const hits = g.map((s, i) => (s.size ? i : -1)).filter(i => i >= 0);
    const leading = hits.length ? hits[0] : g.length;
    for (const v of splitSlots(leading)) parts.push(`r.${v}`);
    hits.forEach((start, h) => {
        const end = hits[h + 1] ?? g.length;
        const [first, ...rest] = splitSlots(end - start);
        parts.push(`${chord(g[start])}.${first}`);
        for (const v of rest) parts.push(`r.${v}`);
    });
    return parts.join(' ');
}

function tripletBarTex(g) {
    return g.map(s => (s.size ? `${chord(s)}.8{tu 3}` : 'r.8{tu 3}')).join(' ');
}

/**
 * @param bars   [{ ticks, onsets }] from barsFromScore
 * @param style  a DRUM_STYLES key, or an array with one style per bar
 * @returns alphaTex for a drum track, to append after the guitar track
 */
export function drumTrackTex(bars, style = 'rock') {
    const styleFor = i => (Array.isArray(style) ? style[i] ?? style[style.length - 1] : style);
    const barTex = bars.map((bar, i) => {
        const s = styleFor(i);
        if (!DRUM_STYLES[s]) throw new Error(`Unknown drum style "${s}"`);
        // Crash on the first beat of the drill and whenever the groove changes.
        const accent = i === 0 || styleFor(i - 1) !== s;
        if (s === 'shuffle' && bar.ticks % TRIPLET_EIGHTH === 0) {
            const g = shuffleBar(bar.ticks / TRIPLET_EIGHTH);
            if (accent) g[0].add(CRASH);
            return tripletBarTex(g);
        }
        const n = Math.round(bar.ticks / SIXTEENTH);
        const onsetSlots = bar.onsets.map(t => Math.round(t / SIXTEENTH));
        const pattern = s === 'shuffle' ? 'rock' : s;
        const g = PATTERNS[pattern](n, onsetSlots);
        if (accent) {
            g[0].delete(HH);
            g[0].delete(RIDE);
            g[0].add(CRASH);
        }
        return sixteenthBarTex(g);
    });
    return [
        '\\track "Drums" { instrument percussion }',
        '\\staff { score }',
        '\\articulation defaults',
        barTex.join(' |\n'),
    ].join('\n');
}

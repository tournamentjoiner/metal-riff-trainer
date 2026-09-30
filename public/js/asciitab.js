// Converts plain-text guitar tab (the familiar six "e|--0--3--|" lines) into
// alphaTex so alphaTab can draw it. Pure functions: unit-tested in Node.
//
// Text tab has no rhythm, so note lengths are estimated from how far apart the
// notes are written. Tab-only staves don't draw rhythm, so this only affects spacing.

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS = { DB: 'C#', EB: 'D#', GB: 'F#', AB: 'G#', BB: 'A#' };
const STANDARD = [64, 59, 55, 50, 45, 40]; // E4 B3 G3 D3 A2 E2, high to low

// Optional string name, then the tab body. Body chars: frets, dashes, bar lines, techniques.
const LINE_RE = /^\s*([A-Ga-g](?:#|b)?)?\s*([|:]?)(.*)$/;
const BODY_RE = /^[-0-9xXhHpPbBrR/\\~()|.*<>^sSvVtT=: ]*$/;

function isTabLine(line) {
    const m = line.match(LINE_RE);
    if (!m) return false;
    const body = m[3].trimEnd();
    return BODY_RE.test(body) && (body.match(/-/g) ?? []).length >= 4;
}

function noteIndex(name) {
    const n = name.toUpperCase();
    return NOTE_NAMES.indexOf(FLATS[n] ?? n);
}

/** String names top-to-bottom (e.g. ["e","B","G","D","A","D"]) -> MIDI pitches. */
export function tuningFromNames(names) {
    if (names.some(n => !n || noteIndex(n) < 0)) return null;
    const pitches = [];
    for (const [i, name] of names.entries()) {
        const idx = noteIndex(name);
        if (i === 0) {
            // Top string: the octave that puts it closest to standard high E.
            let best = null;
            for (let octave = 2; octave <= 5; octave++) {
                const p = (octave + 1) * 12 + idx;
                if (best == null || Math.abs(p - 64) < Math.abs(best - 64)) best = p;
            }
            pitches.push(best);
        } else {
            // Each lower string: the highest pitch with that name below the string above.
            let p = pitches[i - 1] - 1;
            while (((p % 12) + 12) % 12 !== idx) p--;
            pitches.push(p);
        }
    }
    return pitches;
}

export function pitchName(midi) {
    return `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

/** Splits text into blocks of consecutive tab lines. */
function findSystems(text) {
    const systems = [];
    let current = [];
    for (const raw of text.replace(/\t/g, '    ').split(/\r?\n/)) {
        if (isTabLine(raw)) {
            current.push(raw);
        } else if (current.length) {
            systems.push(current);
            current = [];
        }
    }
    if (current.length) systems.push(current);
    return systems;
}

function splitLine(line) {
    const m = line.match(LINE_RE);
    return { name: m[1] ?? null, body: m[3].replace(/\s+$/, '') };
}

const isDigit = ch => ch >= '0' && ch <= '9';

/**
 * Reads one six-line system into bars of beats.
 * Beat = { col, notes: [{ string, fret, dead, hammer, slide, bend, vibrato }] }
 */
function readSystem(bodies) {
    const width = Math.max(...bodies.map(b => b.length));
    const rows = bodies.map(b => b.padEnd(width, '-'));
    const bars = [];
    let beats = [];
    let barStart = 0;
    const byCol = new Map();

    const closeBar = endCol => {
        const sorted = [...byCol.values()].sort((a, b) => a.col - b.col);
        byCol.clear();
        if (sorted.length) bars.push({ beats: sorted, start: barStart, end: endCol });
        barStart = endCol + 1;
    };

    for (let c = 0; c < width; c++) {
        // A bar line is a column where most strings show '|'.
        const pipes = rows.filter(r => r[c] === '|').length;
        if (pipes >= Math.ceil(rows.length / 2)) {
            closeBar(c);
            continue;
        }
        rows.forEach((row, s) => {
            const ch = row[c];
            let note = null;
            let end = c;
            if (isDigit(ch) && !isDigit(row[c - 1] ?? '')) {
                // Frets can be two digits ("12"); a third digit starts a new note.
                end = isDigit(row[c + 1] ?? '') ? c + 1 : c;
                // Don't swallow the "9" in "7b9" (bend target) or "r7" (release) here:
                // those are consumed below when reading the technique after a note.
                if ((row[c - 1] ?? '').toLowerCase() === 'b' || (row[c - 1] ?? '').toLowerCase() === 'r') return;
                note = { string: s + 1, fret: Number(row.slice(c, end + 1)) };
            } else if (ch === 'x' || ch === 'X') {
                note = { string: s + 1, fret: 0, dead: true };
            }
            if (!note) return;
            const next = (row[end + 1] ?? '').toLowerCase();
            if (next === 'h' || next === 'p') note.hammer = true;
            if (next === '/' || next === '\\' || next === 's') note.slide = true;
            if (next === 'b') note.bend = true;
            if (next === '~' || next === 'v') note.vibrato = true;
            const beat = byCol.get(c) ?? { col: c, notes: [] };
            beat.notes.push(note);
            byCol.set(c, beat);
        });
    }
    closeBar(width);
    return bars;
}

/** Column gap to the next note -> note value (16 = sixteenth, 8 = eighth, ...). */
export function durationForGap(gap) {
    if (gap <= 2) return 16;
    if (gap <= 4) return 8;
    if (gap <= 7) return 4;
    return 2;
}

function noteTex(n) {
    if (n.dead) return `x.${n.string}`;
    const effects = [];
    if (n.hammer) effects.push('h');
    if (n.slide) effects.push('sl');
    if (n.bend) effects.push('b (0 4)');
    if (n.vibrato) effects.push('v');
    return `${n.fret}.${n.string}${effects.length ? `{${effects.join(' ')}}` : ''}`;
}

/**
 * @returns {{ tex: string, barCount: number, tuning: number[], warnings: string[] }}
 * @throws Error with a user-facing message if no usable tab is found.
 */
export function asciiTabToAlphaTex(text, { title = 'Riff' } = {}) {
    const warnings = [];
    const systems = findSystems(String(text ?? ''));
    const usable = systems.filter(sys => {
        if (sys.length === 6) return true;
        warnings.push(sys.length === 4
            ? 'Skipped a 4-line block (bass tab isn\'t supported yet).'
            : `Skipped a block with ${sys.length} lines; guitar tab needs 6.`);
        return false;
    });
    if (!usable.length) {
        throw new Error('Couldn\'t find any guitar tab. Paste six lines like "e|---0---|" (high e on top, low E at the bottom).');
    }

    let tuning = null;
    const bars = [];
    for (const sys of usable) {
        const lines = sys.map(splitLine);
        const names = lines.map(l => l.name);
        if (names.every(Boolean)) {
            const t = tuningFromNames(names);
            if (t && !tuning) tuning = t;
            else if (t && t.join() !== tuning.join()) warnings.push('Tuning names differ between blocks; using the first.');
        }
        bars.push(...readSystem(lines.map(l => l.body)));
    }
    tuning ??= STANDARD;
    if (!bars.length) throw new Error('The tab has no notes in it yet.');

    const barTex = bars.map(bar => {
        let last = null;
        return bar.beats.map((beat, i) => {
            const nextCol = bar.beats[i + 1]?.col ?? bar.end;
            const dur = durationForGap(nextCol - beat.col);
            const notes = beat.notes.sort((a, b) => a.string - b.string).map(noteTex);
            const body = notes.length === 1 ? notes[0] : `(${notes.join(' ')})`;
            const prefix = dur === last ? '' : `:${dur} `;
            last = dur;
            return prefix + body;
        }).join(' ');
    });

    const head = [
        `\\title "${title.replace(/["\\]/g, '')}"`,
        '\\track "Guitar"',
    ];
    if (tuning.join() !== STANDARD.join()) head.push(`\\tuning ${tuning.map(pitchName).join(' ')}`);
    return {
        tex: `${head.join('\n')}\n${barTex.join(' |\n')}\n`,
        barCount: bars.length,
        tuning,
        warnings,
    };
}

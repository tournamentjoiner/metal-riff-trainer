import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as alphaTab from '@coderline/alphatab';
import { drumTrackTex, barsFromScore, DRUM_STYLES } from '../public/js/drums.js';
import { DRILLS } from '../public/js/drills.js';

const settings = () => new alphaTab.Settings();
const loadDrill = file => readFileSync(new URL(`../public/drills/${file}`, import.meta.url), 'utf8');
const parse = tex => alphaTab.importer.ScoreLoader.loadAlphaTex(tex, settings());

function withDrums(file, style) {
    const tex = loadDrill(file);
    const bars = barsFromScore(parse(tex));
    return parse(`${tex}\n${drumTrackTex(bars, style)}`);
}

function assertFullBars(score, trackIndex) {
    for (const bar of score.tracks[trackIndex].staves[0].bars) {
        const expected = score.masterBars[bar.index].calculateDuration();
        const ticks = bar.voices[0].beats.reduce((sum, b) => sum + b.playbackDuration, 0);
        assert.equal(ticks, expected, `drum bar ${bar.index + 1} is ${ticks} ticks, expected ${expected}`);
    }
}

const hitsAt = (score, barIndex) => score.tracks[1].staves[0].bars[barIndex].voices[0].beats
    .filter(b => !b.isRest).map(b => b.playbackStart);

for (const style of Object.keys(DRUM_STYLES)) {
    test(`"${style}" drums parse as a percussion track with full 4/4 bars`, () => {
        const score = withDrums('gallop-drill.alphatex', style);
        assert.equal(score.tracks.length, 2);
        assert.equal(score.tracks[1].name, 'Drums');
        assert.equal(score.tracks[1].staves[0].isPercussion, true);
        assertFullBars(score, 1);
    });
}

test('drums follow a 7/8 bar and a tempo change', () => {
    const drill = DRILLS.find(d => d.file === 'dm-death-metal-gauntlet.alphatex');
    const score = withDrums(drill.file, drill.drums);
    assertFullBars(score, 1);
    assert.equal(score.masterBars[4].timeSignatureNumerator, 7);
    assert.equal(score.masterBars.length, score.tracks[1].staves[0].bars.length);
});

test('"follow" puts a kick on every guitar note', () => {
    const tex = loadDrill('dm-slam-groove.alphatex');
    const guitar = parse(tex);
    const score = withDrums('dm-slam-groove.alphatex', 'follow');
    const guitarOnsets = guitar.tracks[0].staves[0].bars[0].voices[0].beats
        .filter(b => !b.isRest).map(b => b.playbackStart);
    // Kick drum = General MIDI note 35 or 36.
    const arts = score.tracks[1].percussionArticulations;
    const isKick = n => [35, 36].includes(arts[n.percussionArticulation]?.outputMidiNumber);
    const kickBeats = score.tracks[1].staves[0].bars[0].voices[0].beats
        .filter(b => b.notes.some(isKick))
        .map(b => b.playbackStart);
    assert.ok(kickBeats.length > 0);
    for (const t of guitarOnsets) assert.ok(kickBeats.includes(t), `no drum hit at guitar note tick ${t}`);
});

test('blast beat hits every 16th; rock beat has 8th-note hi-hats', () => {
    const blast = withDrums('gallop-drill.alphatex', 'blast');
    assert.equal(hitsAt(blast, 1).length, 16);
    const rock = withDrums('gallop-drill.alphatex', 'rock');
    assert.equal(hitsAt(rock, 1).length, 8);
});

test('shuffle uses a triplet grid', () => {
    const score = withDrums('dm-death-n-roll-shuffle.alphatex', 'shuffle');
    assertFullBars(score, 1);
    const beats = score.tracks[1].staves[0].bars[1].voices[0].beats;
    assert.equal(beats.length, 12);
    assert.ok(beats.every(b => b.tupletNumerator === 3));
});

test('every drill gets valid drums with full bars', () => {
    for (const d of DRILLS) {
        const score = withDrums(d.file, d.drums ?? 'rock');
        assertFullBars(score, 1);
    }
});

test('unknown style is rejected', () => {
    assert.throws(() => drumTrackTex([{ ticks: 3840, onsets: [] }], 'polka'), /Unknown drum style/);
});

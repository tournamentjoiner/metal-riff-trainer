// All tab in this file is made up for testing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as alphaTab from '@coderline/alphatab';
import { asciiTabToAlphaTex, tuningFromNames, pitchName, durationForGap } from '../public/js/asciitab.js';

const parse = tex => alphaTab.importer.ScoreLoader.loadAlphaTex(tex, new alphaTab.Settings());
const beatsOf = score => score.tracks[0].staves[0].bars.map(b => b.voices[0].beats);
// alphaTab's model numbers strings from the lowest (1 = low E); tab/alphaTex numbers from the top.
const tabString = n => 7 - n.string;

const SIMPLE = `
e|----------------|----------------|
B|----------------|----------------|
G|----------------|----------------|
D|----------------|-------2--------|
A|-------2---3----|-----2---2------|
E|-0-0-0---0---0--|-0-0-----0--0---|
`;

test('converts a simple two-bar riff', () => {
    const { tex, barCount, warnings } = asciiTabToAlphaTex(SIMPLE, { title: 'Test' });
    assert.equal(barCount, 2);
    assert.deepEqual(warnings, []);
    const score = parse(tex);
    const bars = beatsOf(score);
    assert.equal(bars.length, 2);
    const firstBar = bars[0].map(b => b.notes.map(n => `${n.fret}.${tabString(n)}`).join('+'));
    assert.deepEqual(firstBar, ['0.6', '0.6', '0.6', '2.5', '0.6', '3.5', '0.6']);
    assert.equal(score.tracks[0].staves[0].tuning.join(), '64,59,55,50,45,40');
});

test('reads chords, two-digit frets and techniques', () => {
    const tab = `
e|-----------12h14p12----------|
B|--------------------15b------|
G|-----------------------14~---|
D|-7---7-----------------------|
A|-7---7--x--------------------|
E|-5---5--x--------------------|
`;
    const { tex } = asciiTabToAlphaTex(tab);
    const beats = beatsOf(parse(tex))[0];
    const desc = beats.map(b => b.notes.map(n => {
        let d = n.isDead ? `x.${tabString(n)}` : `${n.fret}.${tabString(n)}`;
        if (n.isHammerPullOrigin) d += 'h';
        if (n.hasBend) d += 'b';
        if (n.vibrato) d += '~';
        return d;
    }).sort().join('+'));
    assert.deepEqual(desc, ['5.6+7.4+7.5', '5.6+7.4+7.5', 'x.5+x.6', '12.1h', '14.1h', '12.1', '15.2b', '14.3~']);
});

test('bend targets and releases are not read as extra notes', () => {
    const tab = `
e|----------------|
B|--7b9r7---5-----|
G|----------------|
D|----------------|
A|----------------|
E|----------------|
`;
    const beats = beatsOf(parse(asciiTabToAlphaTex(tab).tex))[0];
    assert.deepEqual(beats.map(b => `${b.notes[0].fret}.${tabString(b.notes[0])}`), ['7.2', '5.2']);
    assert.equal(beats[0].notes[0].hasBend, true);
});

test('multiple blocks become consecutive bars', () => {
    const block = SIMPLE.trim();
    const { barCount, tex } = asciiTabToAlphaTex(`Intro riff:\n${block}\n\nthen:\n${block}\n`);
    assert.equal(barCount, 4);
    assert.equal(beatsOf(parse(tex)).length, 4);
});

test('works without string names and with tabs indented', () => {
    const tab = SIMPLE.split('\n').map(l => '    ' + l.replace(/^[eBGDAE]/, '')).join('\n');
    const { barCount } = asciiTabToAlphaTex(tab);
    assert.equal(barCount, 2);
});

test('detects Drop D and down-tuned string names', () => {
    const dropD = SIMPLE.replace(/^E\|/m, 'D|');
    const r = asciiTabToAlphaTex(dropD);
    assert.equal(r.tuning.join(), '64,59,55,50,45,38');
    assert.equal(parse(r.tex).tracks[0].staves[0].tuning.join(), '64,59,55,50,45,38');

    assert.deepEqual(tuningFromNames(['d', 'A', 'F', 'C', 'G', 'D']), [62, 57, 53, 48, 43, 38]);
    assert.deepEqual(tuningFromNames(['eb', 'Bb', 'Gb', 'Db', 'Ab', 'Eb']), [63, 58, 54, 49, 44, 39]);
    assert.equal(tuningFromNames(['e', 'B', 'G', 'D', 'A', 'Q']), null);
    assert.equal(pitchName(38), 'D2');
    assert.equal(pitchName(63), 'D#4');
});

test('down-tuned tab parses in alphaTab', () => {
    // Rename bottom-up so a renamed line is never renamed twice.
    const tab = SIMPLE.replace(/^E\|/m, 'D|').replace(/^A\|/m, 'G|').replace(/^D\|/m, 'C|')
        .replace(/^G\|/m, 'F|').replace(/^B\|/m, 'A|').replace(/^e\|/m, 'd|');
    const r = asciiTabToAlphaTex(tab);
    assert.equal(parse(r.tex).tracks[0].staves[0].tuning.join(), '62,57,53,48,43,38');
});

test('warns about bass tab and odd blocks, errors on no tab', () => {
    const bass = `G|-----|\nD|-----|\nA|--3--|\nE|-0---|`.replace(/-----/g, '--------');
    assert.throws(() => asciiTabToAlphaTex(bass), /Couldn't find any guitar tab/);
    const { warnings } = asciiTabToAlphaTex(`${bass}\n\n${SIMPLE}`);
    assert.match(warnings[0], /bass/);
    assert.throws(() => asciiTabToAlphaTex('just some words'), /Couldn't find any guitar tab/);
    assert.throws(() => asciiTabToAlphaTex(''), /Couldn't find any guitar tab/);
    const empty = SIMPLE.replace(/[0-9]/g, '-');
    assert.throws(() => asciiTabToAlphaTex(empty), /no notes/);
});

test('titles with quotes cannot break the alphaTex', () => {
    const { tex } = asciiTabToAlphaTex(SIMPLE, { title: 'My "big" \\ riff' });
    assert.equal(parse(tex).title, 'My big  riff');
});

test('durationForGap spacing buckets', () => {
    assert.deepEqual([1, 2, 3, 4, 5, 7, 8, 20].map(durationForGap), [16, 16, 8, 8, 4, 4, 2, 2]);
});

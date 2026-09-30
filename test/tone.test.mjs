import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as alphaTab from '@coderline/alphatab';
import { applyTone, TONE_PROGRAMS } from '../public/js/tone.js';
import { drumTrackTex, barsFromScore } from '../public/js/drums.js';

const INSTRUMENT = alphaTab.model.AutomationType.Instrument;
const settings = new alphaTab.Settings();
const parse = tex => alphaTab.importer.ScoreLoader.loadAlphaTex(tex, settings);

function drillWithDrums(file = 'gallop-drill.alphatex') {
    const tex = readFileSync(new URL(`../public/drills/${file}`, import.meta.url), 'utf8');
    return parse(`${tex}\n${drumTrackTex(barsFromScore(parse(tex)), 'rock')}`);
}

/** The instrument each channel ends up on, after every program change has played. */
function finalPrograms(score) {
    const midi = new alphaTab.midi.MidiFile();
    new alphaTab.midi.MidiFileGenerator(score, settings, new alphaTab.midi.AlphaSynthMidiFileHandler(midi)).generate();
    const last = {};
    for (const e of midi.events) if (e.program != null) last[e.channel] = e.program;
    return last;
}

test('without a tone the drills play an acoustic guitar (the problem this fixes)', () => {
    const final = finalPrograms(drillWithDrums());
    assert.equal(final[0], 25);
});

for (const [tone, program] of Object.entries(TONE_PROGRAMS)) {
    test(`"${tone}" is the sound the guitar actually ends up on`, () => {
        const score = drillWithDrums();
        applyTone(score, tone, INSTRUMENT);
        const final = finalPrograms(score);
        assert.equal(final[0], program);
        assert.equal(final[1], program);
    });
}

test('"original" restores the file\'s own sound after a tone change', () => {
    const score = drillWithDrums();
    applyTone(score, 'distortion', INSTRUMENT);
    applyTone(score, 'original', INSTRUMENT);
    assert.equal(finalPrograms(score)[0], 25);
});

test('drum channel gets no program changes from the guitar', () => {
    const score = drillWithDrums();
    applyTone(score, 'distortion', INSTRUMENT);
    const final = finalPrograms(score);
    assert.ok(final[9] === undefined || final[9] === 0, `drum channel program is ${final[9]}`);
});

test('bass tracks are left alone', () => {
    const score = parse(String.raw`\track "Bass"
:4 0.4 0.4 0.4 0.4`);
    score.tracks[0].playbackInfo.program = 33; // fingered bass
    for (const b of score.tracks[0].staves[0].bars[0].voices[0].beats) {
        for (const a of b.automations) if (a.type === INSTRUMENT) a.value = 33;
    }
    applyTone(score, 'distortion', INSTRUMENT);
    assert.equal(finalPrograms(score)[0], 33);
});

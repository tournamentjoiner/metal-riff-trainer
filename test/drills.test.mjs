// Verifies every bundled drill parses with alphaTab and is internally consistent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import * as alphaTab from '@coderline/alphatab';
import { DRILLS, CATEGORIES, LEVELS, TUNINGS } from '../public/js/drills.js';

const DRILL_DIR = new URL('../public/drills/', import.meta.url);

function load(file) {
    const tex = readFileSync(new URL(file, DRILL_DIR), 'utf8');
    return alphaTab.importer.ScoreLoader.loadAlphaTex(tex, new alphaTab.Settings());
}

test('drill manifest matches files on disk', () => {
    const onDisk = readdirSync(DRILL_DIR).filter(f => f.endsWith('.alphatex')).sort();
    const listed = DRILLS.map(d => d.file).sort();
    assert.deepEqual(listed, onDisk);
});

test('every drill has valid metadata and a unique title', () => {
    const titles = new Set();
    for (const d of DRILLS) {
        assert.ok(CATEGORIES.includes(d.category), `${d.file}: unknown category ${d.category}`);
        assert.ok(LEVELS[d.level], `${d.file}: unknown level ${d.level}`);
        assert.ok(d.tags.length > 0, `${d.file}: needs at least one tag`);
        assert.ok(d.tip && d.tip.length > 20, `${d.file}: needs a practice tip`);
        assert.ok(d.targetTempo > 0, `${d.file}: needs a target tempo`);
        assert.ok(!titles.has(d.title), `duplicate title ${d.title}`);
        titles.add(d.title);
    }
    for (const c of CATEGORIES) {
        assert.ok(DRILLS.some(d => d.category === c), `category ${c} has no drills`);
    }
});

test('every drill file is in the tuning its manifest entry says', () => {
    for (const d of DRILLS) {
        const name = d.tuning ?? 'E standard';
        assert.ok(TUNINGS[name], `${d.file}: unknown tuning ${name}`);
        const tuning = load(d.file).tracks[0].staves[0].tuning.join(',');
        assert.equal(tuning, TUNINGS[name].join(','), `${d.file} should be ${name}`);
    }
});

test('meter and start tempo match the files', () => {
    for (const d of DRILLS.filter(x => x.meter || x.startTempo)) {
        const score = load(d.file);
        if (d.meter) {
            const used = [...new Set(score.masterBars.map(mb =>
                `${mb.timeSignatureNumerator}/${mb.timeSignatureDenominator}`))].join(' + ');
            assert.equal(used, d.meter, `${d.file} time signatures`);
        }
        if (d.startTempo) {
            // New-style drills: the file's tempo is the goal; the trainer climbs from startTempo.
            assert.equal(score.tempo, d.targetTempo, `${d.file} file tempo should equal its goal tempo`);
            assert.ok(d.startTempo < d.targetTempo, `${d.file} start tempo must be below the goal`);
            assert.ok(d.startTempo / d.targetTempo >= 0.25, `${d.file} start tempo is below the 25% speed floor`);
        }
    }
});

for (const drill of DRILLS) {
    test(`drill "${drill.file}" parses and every bar is full`, () => {
        const score = load(drill.file);
        assert.equal(score.title, drill.title);
        assert.ok(score.masterBars.length >= 2, 'expected at least 2 bars');
        for (const bar of score.tracks[0].staves[0].bars) {
            // Ticks: quarter note = 960, so 4/4 = 3840 and 7/8 = 3360.
            const expected = score.masterBars[bar.index].calculateDuration();
            const ticks = bar.voices[0].beats.reduce((sum, b) => sum + b.playbackDuration, 0);
            assert.equal(ticks, expected, `bar ${bar.index + 1} of ${drill.file} is ${ticks} ticks, expected ${expected}`);
        }
    });
}

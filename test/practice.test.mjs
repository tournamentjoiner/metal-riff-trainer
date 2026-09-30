import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    SpeedTrainer, LoopCounter, clampSpeed, isLoopWrap, summarizeSessions, formatDuration, effectiveBpm,
    tickForProgress,
} from '../public/js/practice.js';

test('clampSpeed keeps speed within 25-150%', () => {
    assert.equal(clampSpeed(10), 25);
    assert.equal(clampSpeed(200), 150);
    assert.equal(clampSpeed(72.4), 72);
});

test('SpeedTrainer raises speed every N loops and stops at target', () => {
    const t = new SpeedTrainer({ start: 60, step: 10, target: 80, loopsPerStep: 2 });
    assert.equal(t.speed, 60);
    assert.equal(t.loopCompleted(), false);
    assert.equal(t.loopCompleted(), true);
    assert.equal(t.speed, 70);
    t.loopCompleted();
    t.loopCompleted();
    assert.equal(t.speed, 80);
    assert.equal(t.done, false, 'must still play target speed loopsPerStep times');
    t.loopCompleted();
    assert.equal(t.loopCompleted(), false);
    assert.equal(t.speed, 80);
    assert.equal(t.done, true);
    assert.equal(t.totalLoops, 6);
});

test('SpeedTrainer does not overshoot target', () => {
    const t = new SpeedTrainer({ start: 90, step: 7, target: 100, loopsPerStep: 1 });
    t.loopCompleted();
    t.loopCompleted();
    assert.equal(t.speed, 100);
});

test('SpeedTrainer stepBack never goes below start', () => {
    const t = new SpeedTrainer({ start: 60, step: 5, target: 100, loopsPerStep: 1 });
    t.loopCompleted();
    t.stepBack();
    t.stepBack();
    assert.equal(t.speed, 60);
});

test('SpeedTrainer rejects bad config', () => {
    assert.throws(() => new SpeedTrainer({ step: 0 }), RangeError);
    assert.throws(() => new SpeedTrainer({ loopsPerStep: 0 }), RangeError);
});

test('isLoopWrap detects wrap but not small seeks', () => {
    const range = { startTick: 0, endTick: 3840 };
    assert.equal(isLoopWrap(3800, 10, range), true);
    assert.equal(isLoopWrap(2000, 1500, range), false);
    assert.equal(isLoopWrap(100, 200, range), false);
    assert.equal(isLoopWrap(null, 0, range), false);
    assert.equal(isLoopWrap(3800, 10, null), false);
});

test('LoopCounter ignores duplicate wraps that arrive too soon', () => {
    let clock = 0;
    const counter = new LoopCounter(() => clock);
    const range = { startTick: 0, endTick: 3840 };
    const loopMs = 2000;

    clock = 1900; counter.update(3700, range, loopMs);
    clock = 2000;
    assert.equal(counter.update(0, range, loopMs), true, 'real wrap counts');
    // Stale high position then another jump back straight after the wrap.
    clock = 2050; counter.update(3800, range, loopMs);
    clock = 2100;
    assert.equal(counter.update(10, range, loopMs), false, 'duplicate wrap ignored');
    clock = 3900; counter.update(3700, range, loopMs);
    clock = 4000;
    assert.equal(counter.update(0, range, loopMs), true, 'next real wrap counts');
});

test('LoopCounter.reset restarts the timer', () => {
    let clock = 0;
    const counter = new LoopCounter(() => clock);
    const range = { startTick: 0, endTick: 3840 };
    clock = 500;
    counter.reset();
    counter.update(3800, range, 2000);
    clock = 1000;
    assert.equal(counter.update(0, range, 2000), false, 'only 500ms since reset');
});

test('tickForProgress spreads time over written notes and skips gaps', () => {
    // Bar 1 has notes only in its first half (ticks 0-1919); bar 2 starts at 3840.
    const beats = [
        { tick: 0, duration: 960 },
        { tick: 960, duration: 960 },
        { tick: 3840, duration: 1920 },
    ];
    assert.equal(tickForProgress(beats, 0), 0);
    assert.equal(tickForProgress(beats, 0.25), 960);
    assert.equal(tickForProgress(beats, 0.5), 3840, 'halfway jumps over the empty end of bar 1');
    assert.equal(tickForProgress(beats, 0.75), 4800);
    assert.equal(tickForProgress(beats, 1), 5759);
    assert.equal(tickForProgress(beats, -1), 0);
    assert.equal(tickForProgress(beats, 2), 5759);
    assert.equal(tickForProgress([], 0.5), null);
});

test('summarizeSessions computes totals and streak', () => {
    const now = new Date(2026, 8, 29, 20);
    const day = n => new Date(2026, 8, 29 - n, 12);
    const s = summarizeSessions([
        { date: day(0), seconds: 600, speed: 80 },
        { date: day(1), seconds: 300, speed: 95 },
        { date: day(2), seconds: 60, speed: 70 },
        { date: day(5), seconds: 60, speed: 100 },
    ], now);
    assert.deepEqual(s, { totalSeconds: 1020, bestSpeed: 100, streak: 3, sessionCount: 4 });
});

test('streak still counts if last practice was yesterday', () => {
    const now = new Date(2026, 8, 29, 8);
    const s = summarizeSessions([{ date: new Date(2026, 8, 28, 22), seconds: 60, speed: 50 }], now);
    assert.equal(s.streak, 1);
    assert.equal(summarizeSessions([], now).streak, 0);
});

test('formatDuration and effectiveBpm', () => {
    assert.equal(formatDuration(45), '45s');
    assert.equal(formatDuration(125), '2m');
    assert.equal(formatDuration(3720), '1h 2m');
    assert.equal(effectiveBpm(180, 75), 135);
});

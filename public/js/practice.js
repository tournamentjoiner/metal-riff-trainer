// Pure practice logic (no DOM, no alphaTab) so it can be unit-tested in Node.

export const MIN_SPEED = 25;
export const MAX_SPEED = 150;

export function clampSpeed(pct) {
    return Math.min(MAX_SPEED, Math.max(MIN_SPEED, Math.round(pct)));
}

/**
 * Speed trainer: plays a looped section at `start`% speed and raises the
 * speed by `step`% every `loopsPerStep` clean loops until `target`% is reached.
 */
export class SpeedTrainer {
    constructor({ start = 60, step = 5, target = 100, loopsPerStep = 2 } = {}) {
        if (step <= 0) throw new RangeError('step must be positive');
        if (loopsPerStep < 1) throw new RangeError('loopsPerStep must be at least 1');
        this.start = clampSpeed(start);
        this.target = clampSpeed(Math.max(target, this.start));
        this.step = step;
        this.loopsPerStep = Math.floor(loopsPerStep);
        this.reset();
    }

    reset() {
        this.speed = this.start;
        this.loopsAtSpeed = 0;
        this.totalLoops = 0;
    }

    get done() {
        return this.speed >= this.target && this.loopsAtSpeed >= this.loopsPerStep;
    }

    /** Call once per completed loop. Returns true if the speed changed. */
    loopCompleted() {
        this.totalLoops++;
        this.loopsAtSpeed++;
        if (this.loopsAtSpeed < this.loopsPerStep || this.speed >= this.target) {
            return false;
        }
        this.speed = Math.min(this.target, this.speed + this.step);
        this.loopsAtSpeed = 0;
        return true;
    }

    /** Drop back one step, e.g. after the player keeps missing it. */
    stepBack() {
        this.speed = Math.max(this.start, this.speed - this.step);
        this.loopsAtSpeed = 0;
    }
}

/**
 * alphaTab has no "loop completed" event, so we detect the playhead jumping
 * back to the start of the looped range. A backwards jump of more than half
 * the range counts as a wrap; smaller backward moves are treated as seeks.
 */
export function isLoopWrap(prevTick, currentTick, range) {
    if (!range || prevTick == null) return false;
    const length = range.endTick - range.startTick;
    if (length <= 0) return false;
    return prevTick - currentTick > length / 2;
}

/**
 * Counts completed loops from a stream of playhead positions. A backwards
 * jump only counts if at least half the expected loop duration has passed
 * since the previous one, so clicking back into the section mid-loop isn't
 * mistaken for finishing it.
 */
export class LoopCounter {
    constructor(now = () => performance.now()) {
        this.now = now;
        this.reset();
    }

    reset() {
        this.prevTick = null;
        this.lastWrapAt = this.now();
    }

    /**
     * @param tick     current playhead tick
     * @param range    { startTick, endTick } being looped
     * @param loopMs   expected wall-clock duration of one loop
     * @returns true if this position completes a loop
     */
    update(tick, range, loopMs) {
        const jumpedBack = isLoopWrap(this.prevTick, tick, range);
        this.prevTick = tick;
        if (!jumpedBack) return false;
        const t = this.now();
        if (t - this.lastWrapAt < loopMs / 2) return false;
        this.lastWrapAt = t;
        return true;
    }
}

/**
 * Maps progress through a riff (0-1) to a tick position, spreading time across
 * the notes that are actually written. Bars that aren't full (common in
 * text tab) would otherwise leave the cursor stuck on an empty stretch.
 * @param beats [{ tick, duration }] in playback order
 */
export function tickForProgress(beats, progress) {
    if (!beats.length) return null;
    const total = beats.reduce((sum, b) => sum + b.duration, 0);
    let remaining = Math.min(1, Math.max(0, progress)) * total;
    for (const beat of beats) {
        if (remaining < beat.duration) return beat.tick + Math.floor(remaining);
        remaining -= beat.duration;
    }
    const last = beats[beats.length - 1];
    return last.tick + last.duration - 1;
}

function dayKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Summarise practice sessions: [{ date, seconds, speed }].
 * Streak = consecutive days with practice, ending today or yesterday.
 */
export function summarizeSessions(sessions, now = new Date()) {
    const totalSeconds = sessions.reduce((sum, s) => sum + s.seconds, 0);
    const bestSpeed = sessions.reduce((best, s) => Math.max(best, s.speed ?? 0), 0);
    const days = new Set(sessions.map(s => dayKey(s.date)));

    let streak = 0;
    const cursor = new Date(now);
    if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (days.has(dayKey(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }
    return { totalSeconds, bestSpeed, streak, sessionCount: sessions.length };
}

export function formatDuration(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return `${s}s`;
}

/** Effective BPM given the song's written tempo and the playback speed %. */
export function effectiveBpm(songTempo, speedPct) {
    return Math.round((songTempo * speedPct) / 100);
}

// Pure helpers for YouTube play-along (no DOM, no player) so they can be unit-tested.

const ID_RE = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = new Set([
    'youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com',
    'youtube-nocookie.com', 'www.youtube-nocookie.com', 'youtu.be', 'www.youtu.be',
]);

/**
 * Extracts the 11-character video id from anything a user might paste or drag:
 * watch links, youtu.be short links, shorts, embeds, live links, or a bare id.
 * Returns null if it isn't a YouTube video.
 */
export function parseYouTubeId(input) {
    if (typeof input !== 'string') return null;
    // Drags can carry several lines (text/uri-list); use the first URL-looking one.
    const text = input.split(/\r?\n/).map(s => s.trim()).find(s => s && !s.startsWith('#')) ?? '';
    if (ID_RE.test(text)) return text;

    let url;
    try {
        url = new URL(/^[a-z]+:\/\//i.test(text) ? text : `https://${text}`);
    } catch {
        return null;
    }
    if (!HOSTS.has(url.hostname.toLowerCase())) return null;

    let id = null;
    if (url.hostname.toLowerCase().endsWith('youtu.be')) {
        id = url.pathname.split('/')[1];
    } else if (url.pathname === '/watch') {
        id = url.searchParams.get('v');
    } else {
        const m = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/);
        id = m?.[1] ?? null;
    }
    return id && ID_RE.test(id) ? id : null;
}

/** Start time from a link like ...?t=1m23s or &t=83, in seconds (or null). */
export function parseStartTime(input) {
    try {
        const url = new URL(/^[a-z]+:\/\//i.test(input) ? input : `https://${input}`);
        const t = url.searchParams.get('t') ?? url.searchParams.get('start');
        if (!t) return null;
        if (/^\d+$/.test(t)) return Number(t);
        const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
        if (!m || !m[0]) return null;
        return (Number(m[1] ?? 0) * 3600) + (Number(m[2] ?? 0) * 60) + Number(m[3] ?? 0);
    } catch {
        return null;
    }
}

/** 83.46 -> "1:23.5" (tenths are shown because riffs need precise edges). */
export function formatTime(seconds) {
    const s = Math.max(0, Number(seconds) || 0);
    const tenths = Math.round(s * 10);
    const h = Math.floor(tenths / 36000);
    const m = Math.floor((tenths % 36000) / 600);
    const sec = Math.floor((tenths % 600) / 10);
    const t = tenths % 10;
    const mm = h ? String(m).padStart(2, '0') : String(m);
    return `${h ? `${h}:` : ''}${mm}:${String(sec).padStart(2, '0')}.${t}`;
}

/** "1:23.5", "83", "0:01:23" -> seconds, or null if unreadable. */
export function parseTime(text) {
    const str = String(text ?? '').trim();
    if (!/^\d+(?::\d{1,2}){0,2}(?:\.\d+)?$/.test(str)) return null;
    const parts = str.split(':');
    let seconds = 0;
    for (const part of parts) seconds = seconds * 60 + Number(part);
    const bad = parts.slice(1).some(p => Number(p.split('.')[0]) >= 60);
    return bad ? null : seconds;
}

export const MIN_RIFF_SECONDS = 0.5;

/** Returns an error message for an invalid riff range, or null if it's fine. */
export function validateRiff(start, end, duration) {
    if (start == null || end == null) return 'Set both a start and an end time.';
    if (start < 0) return 'Start time can\'t be negative.';
    if (end - start < MIN_RIFF_SECONDS) return 'The end must be at least half a second after the start.';
    if (duration && end > duration + 0.05) return `The video is only ${formatTime(duration)} long.`;
    return null;
}

/** Messages for the IFrame player's numeric error codes. */
export function playerErrorMessage(code) {
    switch (code) {
        case 2: return 'That link doesn\'t point to a valid YouTube video.';
        case 5: return 'This video can\'t be played in the embedded player.';
        case 100: return 'That video was removed or is private.';
        case 101:
        case 150: return 'The video\'s owner doesn\'t allow it to be played in other apps. Try another upload of the song.';
        default: return `YouTube couldn't play this video (error ${code}).`;
    }
}
